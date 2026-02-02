# Razorpay Environment Variables Fix

## Issue
The Razorpay API function was using `VITE_RAZORPAY_KEY_ID` and `VITE_RAZORPAY_SECRET_KEY`, but in Vercel serverless functions, environment variables should NOT use the `VITE_` prefix.

## Problem
- `VITE_` prefix is only for **client-side** variables (exposed to browser)
- Serverless functions need **server-side** variables (not exposed to browser)
- Using `VITE_` in serverless functions can cause the variables to be undefined

## Solution
Updated `api/create-razorpay-order.ts` to check both:
1. Server-side variables: `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET_KEY`
2. Fallback to client-side: `VITE_RAZORPAY_KEY_ID` and `VITE_RAZORPAY_SECRET_KEY`

## Vercel Environment Variables Setup

### Required Variables in Vercel Dashboard:

**For Serverless Functions (Server-side):**
```
RAZORPAY_KEY_ID=rzp_live_haBkj2sEVVLVrK
RAZORPAY_SECRET_KEY=your_secret_key_here
```

**For Client-side (if needed):**
```
VITE_RAZORPAY_KEY_ID=rzp_live_haBkj2sEVVLVrK
```

### How to Add:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `mindspace-app`
3. Go to **Settings** → **Environment Variables**
4. Add the variables:
   - **Key**: `RAZORPAY_KEY_ID`
   - **Value**: Your Razorpay Key ID (e.g., `rzp_live_...`)
   - **Environment**: Production, Preview, Development (select all)
5. Add the secret:
   - **Key**: `RAZORPAY_SECRET_KEY`
   - **Value**: Your Razorpay Secret Key
   - **Environment**: Production, Preview, Development (select all)
6. Click **Save**

### Important Notes:

- **Never** expose `RAZORPAY_SECRET_KEY` in client-side code
- The secret key should **only** be in server-side environment variables
- After adding variables, redeploy your application

## Testing

After updating environment variables:
1. Redeploy your Vercel application
2. Test payment flow
3. Check that orders are created successfully
4. Verify no 500/400 errors in Razorpay API calls

## Error Codes

If you see:
- **500 Internal Server Error**: Check that `RAZORPAY_SECRET_KEY` is set correctly
- **400 Bad Request**: Check that `RAZORPAY_KEY_ID` is correct and matches the secret key
- **401 Unauthorized**: Credentials are incorrect

