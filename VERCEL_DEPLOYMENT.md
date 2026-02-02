# Vercel Deployment Guide

This guide will help you deploy the TARA Mental Health App to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A Firebase project with Firestore enabled
3. Razorpay account (for payments)
4. ElevenLabs API key (for voice calling)
5. Groq API key (for chat)

## Step 1: Environment Variables Setup

### Required Environment Variables

Add the following environment variables in your Vercel project settings:

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)
```

#### Razorpay Configuration
```
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id (or rzp_test_... for testing)
VITE_RAZORPAY_SECRET_KEY=your_razorpay_secret_key
```

#### ElevenLabs Configuration
```
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_ELEVENLABS_VOICE_ID=your_elevenlabs_voice_id
VITE_ELEVENLABS_CONVERSATION_ID=your_conversation_id
```

#### Groq API Configuration
```
VITE_GROQ_API_KEY=your_groq_api_key
```

#### Cal.com Configuration (Optional)
```
VITE_CAL_COM_LINK=your_cal_com_link
```

### How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments
4. Click **Save**

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Vercel will auto-detect the Vite framework
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add all environment variables (from Step 1)
6. Click **Deploy**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Post-Deployment Configuration

### 1. Firebase Authentication

Ensure your Firebase project has the following authentication providers enabled:
- Email/Password
- Google Sign-In

Add your Vercel domain to Firebase Authorized Domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain (e.g., `your-app.vercel.app`)

### 2. Firestore Security Rules

Update your Firestore security rules to allow authenticated access. Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /user/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /call_logs/{logId} {
      allow read, write: if request.auth != null && resource.data.uid == request.auth.uid;
    }
    
    match /usage/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add similar rules for other collections
  }
}
```

### 3. Firestore Indexes

Create the required composite indexes in Firebase Console:
- Go to Firestore → Indexes
- The required indexes are listed in `firestore.indexes.json`
- Click "Create Index" for each missing index

### 4. Razorpay Webhook (Optional)

If you want to handle payment webhooks:
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.vercel.app/api/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`, `order.paid`

## Step 4: Testing the Deployment

### 1. Test Authentication
- [ ] Sign up with email
- [ ] Sign in with Google
- [ ] Sign out

### 2. Test Core Features
- [ ] Voice calling with TARA
- [ ] Chat functionality
- [ ] Journal entries
- [ ] Mood tracking
- [ ] Assessments

### 3. Test Payments
- [ ] Subscription plan selection
- [ ] Razorpay payment gateway
- [ ] Payment success/failure handling

### 4. Test PWA Features
- [ ] Install as PWA
- [ ] Offline functionality
- [ ] Service worker updates

## Step 5: Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Firebase Authorized Domains with your custom domain

## Troubleshooting

### Build Errors

**Error: Module not found**
- Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: Environment variable not found**
- Check all variables are added in Vercel dashboard
- Ensure variable names start with `VITE_` for client-side access

### Runtime Errors

**Firebase Authentication not working**
- Verify Firebase config environment variables
- Check Authorized Domains in Firebase Console

**Razorpay payment failing**
- Verify Razorpay keys are correct
- Check serverless function logs in Vercel dashboard
- Ensure live keys are used in production

**Service Worker not updating**
- Clear browser cache
- Check service worker registration in browser DevTools

### Performance Issues

**Slow initial load**
- Check bundle size in Vercel build logs
- Enable Vercel Edge Caching
- Optimize images and assets

## Monitoring

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance metrics
- Track errors and exceptions

### Firebase Monitoring
- Use Firebase Performance Monitoring
- Set up Firebase Crashlytics
- Monitor Firestore usage

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] Firebase security rules are properly configured
- [ ] Razorpay secret keys are never exposed
- [ ] API keys are restricted to specific domains
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] CORS is properly configured

## Support

For issues or questions:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check Firebase documentation: [firebase.google.com/docs](https://firebase.google.com/docs)
- Review application logs in Vercel dashboard

## Additional Resources

- [Vercel Deployment Best Practices](https://vercel.com/docs/concepts/deployments/overview)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [PWA Deployment Guide](./PWA_DEPLOYMENT_GUIDE.md)

