import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .json({});
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = request.body;

    if (!amount || amount <= 0) {
      return response.status(400)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Invalid amount' });
    }

    // Get Razorpay credentials from environment variables
    // Note: In Vercel serverless functions, use RAZORPAY_KEY_ID (not VITE_RAZORPAY_KEY_ID)
    // VITE_ prefix is only for client-side variables
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_SECRET_KEY || process.env.VITE_RAZORPAY_SECRET_KEY;

    if (!keyId || !keySecret) {
      return response.status(500)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Razorpay credentials not configured' });
    }

    // For live keys, make actual API call to Razorpay
    const isLiveKey = keyId.startsWith('rzp_live_');
    
    if (isLiveKey) {
      try {
        // Create order using Razorpay API
        const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          },
          body: JSON.stringify({
            amount: amount * 100, // Convert to paise
            currency: currency,
            receipt: `receipt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
          }),
        });

        if (!razorpayResponse.ok) {
          const errorData = await razorpayResponse.json().catch(() => ({}));
          console.error('Razorpay API error:', errorData);
          return response.status(razorpayResponse.status)
            .setHeader('Access-Control-Allow-Origin', '*')
            .json({
              success: false,
              error: errorData.error?.description || 'Failed to create Razorpay order',
            });
        }

        const orderData = await razorpayResponse.json();
        
        return response.status(200)
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({
            success: true,
            order: {
              id: orderData.id,
              amount: orderData.amount,
              currency: orderData.currency,
            },
          });
      } catch (apiError) {
        console.error('Razorpay API call failed:', apiError);
        return response.status(500)
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({
            success: false,
            error: 'Failed to create order with Razorpay API',
          });
      }
    } else {
      // For test keys, create a mock order (for development/testing)
      const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      
      return response.status(200)
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({
          success: true,
          order: {
            id: orderId,
            amount: amount * 100, // Convert to paise
            currency: currency,
          },
        });
    }
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return response.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      });
  }
}

