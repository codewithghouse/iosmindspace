// Razorpay configuration and utilities
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    email?: string;
    contact?: string;
    method?: string;
  };
  theme: {
    color: string;
    hide_topbar?: boolean;
  };
  modal?: {
    ondismiss?: () => void;
  };
  notes?: {
    source?: string;
    environment?: string;
  };
  method?: {
    netbanking?: boolean;
    wallet?: boolean;
    emi?: boolean;
    upi?: boolean;
    card?: boolean;
  };
  hide?: Array<{ method: string }>;
  display?: {
    show_all_payment_methods?: boolean;
  };
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      // Wait for existing script to load with timeout
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait
      
      const checkRazorpay = () => {
        attempts++;
        if (window.Razorpay) {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Razorpay script load timeout - existing script'));
        } else {
          setTimeout(checkRazorpay, 100);
        }
      };
      checkRazorpay();
      return;
    }

    // Create and load new script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // Add timeout for script loading
    const timeout = setTimeout(() => {
      reject(new Error('Razorpay script load timeout - new script'));
    }, 10000); // 10 second timeout
    
    script.onload = () => {
      clearTimeout(timeout);
      console.log('✅ Razorpay script loaded successfully');
      
      // Wait a bit more for Razorpay to be fully initialized
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds max wait
      
      const checkRazorpay = () => {
        attempts++;
        if (window.Razorpay) {
          console.log('✅ Razorpay initialized successfully');
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('Razorpay failed to initialize after script load'));
        } else {
          setTimeout(checkRazorpay, 100);
        }
      };
      checkRazorpay();
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      console.error('❌ Failed to load Razorpay script');
      reject(new Error('Failed to load Razorpay script - network error'));
    };
    
    // Add error event listener as backup
    script.addEventListener('error', () => {
      clearTimeout(timeout);
      console.error('❌ Razorpay script error event triggered');
      reject(new Error('Razorpay script error event'));
    });
    
    console.log('🌐 Loading Razorpay script from:', script.src);
    document.head.appendChild(script);
  });
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR') => {
  // Validate environment variables
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('Razorpay Key ID not found. Please check your environment variables.');
  }

  const isProduction = import.meta.env.PROD;
  const isLiveKey = keyId.startsWith('rzp_live_');
  const isTestKey = keyId.startsWith('rzp_test_');
  
  // Check if using live key in development
  if (import.meta.env.DEV && isLiveKey) {
    console.warn('⚠️ Warning: Using LIVE Razorpay key in development. Live keys require server-side order creation.');
  }

  // Use server-side order creation for live keys or production
  if (isLiveKey || isProduction) {
    try {
      console.log('🔄 Creating order via server-side function...');
      
      // Use Vercel API route (works in both dev and prod on Vercel)
      // Fallback to Netlify function if Vercel route fails (for local dev with Netlify)
      const apiRoute = '/api/create-razorpay-order';
      
      const response = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: currency,
        }),
      });

      if (!response.ok) {
        // For live keys, server function is REQUIRED - don't fall back to client-side
        if (isLiveKey) {
          // Try Netlify function as fallback in development
          if (import.meta.env.DEV && response.status === 404) {
            console.warn('⚠️ Vercel API route not found, trying Netlify function...');
            try {
              const netlifyResponse = await fetch('/.netlify/functions/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, currency }),
              });
              
              if (netlifyResponse.ok) {
                const data = await netlifyResponse.json();
                if (data.success) {
                  console.log('✅ Netlify order created:', data.order.id);
                  return data.order;
                }
              }
            } catch (netlifyError) {
              // Continue to throw original error
            }
            
            throw new Error(
              'Live Razorpay keys require server-side order creation. ' +
              'The server function is not available. ' +
              'Please either: 1) Use test keys (rzp_test_...) for development, or ' +
              '2) Deploy to Vercel with the API route configured.'
            );
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Server error: ${response.status} - ${errorData.error || 'Unknown error'}`);
          }
        }
        
        // For test keys in development, try Netlify fallback, then client-side
        if (import.meta.env.DEV && response.status === 404 && isTestKey) {
          console.warn('⚠️ Vercel API route not found, trying Netlify function...');
          try {
            const netlifyResponse = await fetch('/.netlify/functions/create-razorpay-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount, currency }),
            });
            
            if (netlifyResponse.ok) {
              const data = await netlifyResponse.json();
              if (data.success) {
                console.log('✅ Netlify order created:', data.order.id);
                return data.order;
              }
            }
          } catch (netlifyError) {
            // Fall through to client-side order creation
            console.warn('⚠️ Netlify function also not found. Falling back to client-side order creation for test keys.');
          }
          // Break out of this block and fall through to client-side order creation
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Server error: ${response.status} - ${errorData.error || 'Unknown error'}`);
        }
      } else {
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to create order');
        }

        console.log('✅ Server-side order created:', data.order.id);
        return data.order;
      }
    } catch (error) {
      // For live keys, never fall back to client-side - it won't work
      if (isLiveKey) {
        console.error('❌ Server-side order creation failed with live key:', error);
        throw new Error(
          error instanceof Error ? error.message : 
          'Live Razorpay keys require server-side order creation. Please set up the server function or use test keys for development.'
        );
      }
      
      // For test keys in development, fall back to client-side
      if (import.meta.env.DEV && isTestKey) {
        console.warn('⚠️ Server-side order creation failed in development. Falling back to client-side order creation for test keys.');
        // Break out and fall through to client-side order creation
      } else {
        // In production, throw the error
        console.error('❌ Server-side order creation failed:', error);
        throw new Error(`Failed to create order: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // For test keys in development, use client-side order creation
  if (isTestKey && import.meta.env.DEV) {
    console.log('📝 Creating client-side order (test key in development)');
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: orderId,
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency
    };
  }

  // Should not reach here, but just in case
  throw new Error('Unable to create order. Please check your Razorpay configuration.');
};

export const openRazorpayGateway = async (options: RazorpayOptions) => {
  try {
    console.log('🚀 Starting Razorpay gateway initialization...');
    
    // Ensure Razorpay script is loaded
    await loadRazorpayScript();
    
    console.log('✅ Razorpay script loaded, checking window.Razorpay...');
    console.log('window.Razorpay available:', !!window.Razorpay);
    
    if (window.Razorpay) {
      // Add additional configuration for better compatibility
      const enhancedOptions = {
        ...options,
        // Add these options for better compatibility
        modal: {
          ...options.modal,
          ondismiss: () => {
            if (options.modal?.ondismiss) {
              options.modal.ondismiss();
            }
          },
        },
        // Add prefill with better defaults
        prefill: {
          ...options.prefill,
          // Don't set default method - let user choose
        },
        // Add notes for better tracking
        notes: {
          source: 'Tara Web App',
          environment: import.meta.env.DEV ? 'development' : 'production'
        },
        // Add theme customization
        theme: {
          ...options.theme,
          hide_topbar: false,
        },
        // Payment method configuration
        method: {
          netbanking: true,
          wallet: false,
          emi: false,
          upi: true,
          card: true,
        },
        // Hide specific payment options
        hide: [
          { method: 'wallet' },
          { method: 'emi' },
          { method: 'qr_code' }
        ],
        // Show payment method selection screen first
        display: {
          show_all_payment_methods: true
        },
        // Ensure we start with method selection, not direct card input
        config: {
          display: {
            hide: []
          }
        },
        // Force payment method selection screen
        checkout: {
          method: {
            netbanking: true,
            wallet: false,
            emi: false,
            upi: true,
            card: true,
          }
        }
      };
      
      const razorpay = new window.Razorpay(enhancedOptions);
      
      // Add error handling for the payment gateway
      razorpay.on('payment.failed', (response: any) => {
        console.error('❌ Payment failed:', response);
      });
      
      razorpay.on('payment.success', (response: any) => {
        console.log('✅ Payment success event:', response);
      });
      
      razorpay.on('payment.cancel', () => {
        console.log('🚫 Payment cancelled by user');
      });
      
      razorpay.open();
    } else {
      console.error('❌ Razorpay not available after script load');
      console.error('Available window properties:', Object.keys(window).filter(key => key.toLowerCase().includes('razor')));
      
      // Try to reload the script as a fallback
      console.log('🔄 Attempting to reload Razorpay script...');
      try {
        await loadRazorpayScript();
        if (window.Razorpay) {
          console.log('✅ Razorpay loaded on retry');
          const razorpay = new window.Razorpay(options);
          razorpay.open();
          return;
        }
      } catch (retryError) {
        console.error('❌ Retry failed:', retryError);
      }
      
      throw new Error('Razorpay not available after script load');
    }
  } catch (error) {
    console.error('Failed to load or initialize Razorpay:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Unable to load payment gateway. Please refresh the page and try again.';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'Payment gateway is taking too long to load. Please check your internet connection and try again.';
      } else if (error.message.includes('CSP')) {
        errorMessage = 'Security policy is blocking payment gateway. Please contact support.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error while loading payment gateway. Please check your connection and try again.';
      }
    }
    
    throw new Error(errorMessage);
  }
};

export const verifyPayment = (response: any) => {
  // Basic client-side verification
  // In production, this should be verified server-side
  return response.razorpay_payment_id && response.razorpay_order_id;
};

