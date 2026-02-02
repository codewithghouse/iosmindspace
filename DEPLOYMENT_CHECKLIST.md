# Vercel Deployment Checklist

Use this checklist to ensure your application is ready for production deployment on Vercel.

## Pre-Deployment

### Environment Variables
- [ ] All Firebase environment variables are set in Vercel
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
  - [ ] `VITE_FIREBASE_MEASUREMENT_ID` (optional)

- [ ] Razorpay configuration
  - [ ] `VITE_RAZORPAY_KEY_ID` (use `rzp_live_...` for production)
  - [ ] `VITE_RAZORPAY_SECRET_KEY`

- [ ] ElevenLabs configuration
  - [ ] `VITE_ELEVENLABS_API_KEY`
  - [ ] `VITE_ELEVENLABS_VOICE_ID`
  - [ ] `VITE_ELEVENLABS_CONVERSATION_ID`

- [ ] Groq API configuration
  - [ ] `VITE_GROQ_API_KEY`

- [ ] Cal.com configuration (optional)
  - [ ] `VITE_CAL_COM_LINK`

### Firebase Configuration
- [ ] Firebase project is set up and active
- [ ] Firestore database is enabled
- [ ] Authentication providers are enabled:
  - [ ] Email/Password
  - [ ] Google Sign-In
- [ ] Vercel domain is added to Firebase Authorized Domains
- [ ] Firestore security rules are configured
- [ ] Firestore indexes are created (see `firestore.indexes.json`)

### Build Verification
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build output is in `dist/` directory
- [ ] Service worker files are generated (`sw.js`, `workbox-*.js`)

## Deployment Steps

### 1. Initial Deployment
- [ ] Connect repository to Vercel
- [ ] Configure build settings:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`
- [ ] Add all environment variables
- [ ] Deploy to preview environment first

### 2. Post-Deployment Configuration
- [ ] Verify deployment URL is accessible
- [ ] Add deployment URL to Firebase Authorized Domains
- [ ] Test authentication flow
- [ ] Verify API routes are working (`/api/create-razorpay-order`)

### 3. Production Deployment
- [ ] Deploy to production
- [ ] Add custom domain (if applicable)
- [ ] Update Firebase Authorized Domains with custom domain
- [ ] Verify SSL certificate is active

## Testing Checklist

### Authentication
- [ ] Email sign up works
- [ ] Email sign in works
- [ ] Google sign in works
- [ ] Password reset works
- [ ] Sign out works
- [ ] Session persistence works

### Core Features
- [ ] Voice calling with TARA
  - [ ] Call starts successfully
  - [ ] Microphone permissions work
  - [ ] Call duration is tracked
  - [ ] Call logs are saved
- [ ] Chat functionality
  - [ ] Messages send/receive
  - [ ] Chat history loads
- [ ] Journal entries
  - [ ] Create entry
  - [ ] View entries
  - [ ] Edit/delete entries
- [ ] Mood tracking
  - [ ] Add mood entry
  - [ ] View mood history
- [ ] Assessments
  - [ ] Start assessment
  - [ ] Complete assessment
  - [ ] View results

### Payments
- [ ] Subscription modal opens
- [ ] Plan selection works
- [ ] Razorpay gateway opens
- [ ] Payment processing works (test with test keys)
- [ ] Payment success updates user subscription
- [ ] Payment failure is handled gracefully

### UI/UX
- [ ] Theme switching works (auto/manual)
- [ ] All screens load without errors
- [ ] Navigation works correctly
- [ ] Responsive design works on mobile
- [ ] Animations are smooth
- [ ] Loading states display correctly

### PWA Features
- [ ] Install prompt appears
- [ ] App installs as PWA
- [ ] Offline mode works (cached pages)
- [ ] Service worker updates correctly
- [ ] Manifest is valid

### Performance
- [ ] Initial load time < 3 seconds
- [ ] No console errors
- [ ] No network errors
- [ ] Images load correctly
- [ ] Fonts load correctly

## Security Checklist

- [ ] No API keys in client-side code
- [ ] Environment variables are secure
- [ ] Firebase security rules are restrictive
- [ ] CORS is properly configured
- [ ] HTTPS is enforced
- [ ] Sensitive data is not logged

## Monitoring Setup

- [ ] Vercel Analytics is enabled
- [ ] Error tracking is configured
- [ ] Performance monitoring is set up
- [ ] Firebase Crashlytics is enabled (optional)

## Documentation

- [ ] README.md is updated
- [ ] Environment variables are documented
- [ ] Deployment guide is complete
- [ ] API documentation is available

## Rollback Plan

- [ ] Previous deployment is saved
- [ ] Database backup is available
- [ ] Rollback procedure is documented

## Final Verification

- [ ] All tests pass
- [ ] No critical errors in logs
- [ ] Performance metrics are acceptable
- [ ] User acceptance testing is complete
- [ ] Stakeholder approval received

---

## Quick Deploy Command

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Build Fails
1. Check Node.js version (should be 18+)
2. Verify all dependencies are in package.json
3. Check for TypeScript errors
4. Review build logs in Vercel dashboard

### API Routes Not Working
1. Verify function is in `api/` directory
2. Check function runtime in vercel.json
3. Review function logs in Vercel dashboard
4. Test function locally with `vercel dev`

### Environment Variables Not Working
1. Verify variables start with `VITE_` for client-side
2. Check variables are set for correct environment
3. Redeploy after adding variables
4. Clear browser cache

### Firebase Errors
1. Verify Firebase config environment variables
2. Check Authorized Domains in Firebase Console
3. Review Firestore security rules
4. Check Firestore indexes

---

**Last Updated**: $(date)
**Deployment Status**: Ready for Production ✅

