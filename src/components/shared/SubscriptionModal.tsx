import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppState } from '../../contexts/AppStateContext';
import { createRazorpayOrder, openRazorpayGateway, verifyPayment, RazorpayOptions } from '../../services/razorpayService';
import { updateSubscription, SubscriptionPlan } from '../../services/subscriptionService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  userRemainingTime?: number;
  showFreeTrial?: boolean;
  isReturningUser?: boolean;
}

export default function SubscriptionModal({ 
  isOpen, 
  onClose, 
  onSelectPlan, 
  userRemainingTime = 0, 
  showFreeTrial = true, 
  isReturningUser = false 
}: SubscriptionModalProps) {
  const { theme } = useTheme();
  const { user } = useAppState();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Only show free plan if showFreeTrial is true AND user has remaining time
  const showFreePlan = showFreeTrial && userRemainingTime > 0;
  
  // Set default selected plan based on whether free plan is available
  const [selectedPlan, setSelectedPlan] = useState<string>('plan1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update selected plan when modal opens or userRemainingTime changes
  // Also clear any previous errors
  useEffect(() => {
    if (isOpen) {
      setError(null); // Clear any previous errors when modal opens
      const defaultPlan = showFreePlan ? 'free' : 'plan1';
      setSelectedPlan(defaultPlan);
    }
  }, [isOpen, showFreePlan, userRemainingTime]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing, onClose]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const plans: SubscriptionPlan[] = [
    ...(showFreePlan ? [{
      id: 'free',
      calls: 1,
      minutes: 20,
      price: 0,
      description: 'Free Trial - 20 min'
    }] : []),
    {
      id: 'plan1',
      calls: 1,
      minutes: 40,
      price: 249,
      description: '1 call - 40 min'
    },
    {
      id: 'plan2',
      calls: 5,
      minutes: 200,
      price: 1150,
      description: '5 calls - 200 min'
    },
    {
      id: 'plan3',
      calls: 10,
      minutes: 400,
      price: 2250,
      description: '10 calls - 400 min'
    }
  ];

  const handleContinue = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan || !user) return;

    setError(null);

    // Handle free plan selection
    if (plan.id === 'free') {
      setIsProcessing(true);
      try {
        onSelectPlan(plan);
        onClose();
      } catch (error) {
        console.error('Error starting free trial:', error);
        setError('Failed to start free trial. Please try again.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Check if Razorpay key is configured for paid plans
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      setError('Payment gateway not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log(`🚀 Starting payment process for plan:`, plan.description);
      
      // Create Razorpay order
      const order = await createRazorpayOrder(plan.price);
      
      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: 'Tara',
        description: `${plan.description} Subscription`,
        order_id: order.id,
        handler: async (response: any) => {
          console.log('💰 Payment response received');
          
          // Payment successful
          if (verifyPayment(response)) {
            try {
              console.log('✅ Payment verified, updating Firebase...');
              
              // Update Firebase subscription
              const result = await updateSubscription(user.uid, user.email || '', plan);
              
              if (result.success) {
                console.log('✅ Subscription updated successfully');
                onSelectPlan(plan);
                onClose();
              } else {
                setError(result.error || 'Failed to update subscription. Please contact support.');
              }
            } catch (error) {
              console.error('❌ Subscription update failed:', error);
              setError('Payment successful but subscription update failed. Please contact support.');
            }
          } else {
            console.error('❌ Payment verification failed');
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#7A8A7A',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      console.log('🌐 Opening Razorpay gateway...');
      await openRazorpayGateway(options);
      
    } catch (error: any) {
      console.error('❌ Payment failed:', error);
      
      // Make error message more user-friendly
      let userFriendlyError = 'Unable to initiate payment. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Live Razorpay keys require server-side')) {
          userFriendlyError = 'Payment gateway configuration issue. Please use test keys for development or contact support for production setup.';
        } else if (error.message.includes('test keys')) {
          userFriendlyError = 'Please use test payment keys for development. Contact support if you need help.';
        } else if (error.message.includes('server function')) {
          userFriendlyError = 'Payment server is not configured. Please contact support.';
        } else {
          userFriendlyError = error.message;
        }
      }
      
      setError(userFriendlyError);
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Theme-aware colors
  const bgColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(247, 245, 242, 0.95)';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const accentGradient = 'linear-gradient(to right, #8B9A85, #7A8A75)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.4)';
  const selectedBg = theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : 'rgba(122, 138, 122, 0.2)';
  const cardBg = theme === 'dark' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.95)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 safe-top safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscription-title"
      >
        <div
          className="rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 ease-out modal-enter backdrop-blur-xl border"
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="rounded-t-3xl px-6 py-5 flex items-center justify-between relative"
            style={{ background: accentGradient }}
          >
            <h2
              id="subscription-title"
              className="text-xl font-bold text-white"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
            >
              {showFreeTrial ? 'Subscription' : 'Upgrade Plan'}
            </h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-all touch-target focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(90vh - 250px)' }}>
            <p
              className="text-sm mb-4"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: textSecondary
              }}
            >
              {showFreeTrial 
                ? (isReturningUser ? 'You have remaining time - continue with free trial' : '1st call - 20 min Free Trial')
                : 'Choose your plan'
              }
            </p>

            {/* Plans */}
            <div className="space-y-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => !isProcessing && setSelectedPlan(plan.id)}
                  disabled={isProcessing}
                  className="w-full rounded-2xl p-4 border-2 transition-all duration-200 text-left touch-target focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
                  style={{
                    backgroundColor: selectedPlan === plan.id ? selectedBg : cardBg,
                    borderColor: selectedPlan === plan.id ? accentColor : borderColor,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p
                        className="text-base font-medium"
                        style={{ color: textPrimary }}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-lg font-bold"
                        style={{ color: textPrimary }}
                      >
                        ₹ {plan.price}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mt-4 p-3 rounded-xl text-sm"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 242, 242, 1)',
                  borderColor: theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(254, 226, 226, 1)',
                  color: theme === 'dark' ? '#ff6b6b' : '#dc2626',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Button */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={handleContinue}
              disabled={isProcessing}
              className="w-full rounded-2xl py-4 px-4 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: accentGradient,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {isProcessing 
                ? 'Processing...' 
                : selectedPlan === 'free' 
                  ? (isReturningUser ? 'Continue with Free Trial' : 'Start Free Trial')
                  : 'Continue to Payment'
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

