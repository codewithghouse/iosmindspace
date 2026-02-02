# Fix Firebase "Unauthorized Domain" Error

## 🔴 Error Message
```
FirebaseError: Firebase: Error (auth/unauthorized-domain)
```

This error occurs when your deployment domain is not authorized in Firebase Authentication.

## ✅ Solution: Add Your Domain to Firebase

### Step 1: Get Your Vercel Deployment URL

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `mindspace-app`
3. Copy your deployment URL (e.g., `mindspace-app.vercel.app` or your custom domain)

### Step 2: Add Domain to Firebase Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `goodmind-dca62` (or your project name)
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add your Vercel domain:
   - **For preview deployments**: `your-app-*.vercel.app` (or specific preview URL)
   - **For production**: `your-app.vercel.app` (or your custom domain)
   - **For local development**: `localhost` (should already be there)

### Step 3: Add All Required Domains

Add these domains to ensure all deployments work:

```
localhost
127.0.0.1
your-app.vercel.app
*.vercel.app (if you want all preview deployments to work)
your-custom-domain.com (if you have one)
```

**Note**: You can use wildcards (`*.vercel.app`) to allow all Vercel preview deployments.

### Step 4: Verify the Fix

1. Wait 1-2 minutes for Firebase to update
2. Refresh your deployed app
3. Try Google Sign-In again
4. The error should be resolved

## 🔧 Additional Configuration (If Still Not Working)

### Check Firebase Auth Domain Configuration

1. In Firebase Console → **Authentication** → **Settings**
2. Verify your **Authorized domains** list includes:
   - `localhost`
   - Your Vercel domain(s)
   - Any custom domains

### Check Environment Variables

Ensure your `VITE_FIREBASE_AUTH_DOMAIN` matches your Firebase project:

```env
VITE_FIREBASE_AUTH_DOMAIN=goodmind-dca62.firebaseapp.com
```

This should match what's shown in Firebase Console → Project Settings → General.

### For Custom Domains

If you're using a custom domain:

1. Add the custom domain to Firebase Authorized Domains
2. Ensure DNS is properly configured
3. Wait for SSL certificate to be issued (Vercel handles this automatically)

## 📋 Quick Checklist

- [ ] Vercel deployment URL copied
- [ ] Domain added to Firebase Authorized Domains
- [ ] `localhost` is in the list (for local development)
- [ ] Production domain added
- [ ] Preview domain pattern added (if needed)
- [ ] Waited 1-2 minutes for changes to propagate
- [ ] Tested Google Sign-In on deployed app

## 🚨 Common Issues

### Issue: Still getting error after adding domain
**Solution**: 
- Clear browser cache and cookies
- Wait 2-3 minutes for Firebase to update
- Try in incognito/private window

### Issue: Works on localhost but not on Vercel
**Solution**: 
- Make sure you added the exact Vercel domain (not just `localhost`)
- Check if you're using preview deployments (add `*.vercel.app` pattern)

### Issue: Custom domain not working
**Solution**:
- Add both `yourdomain.com` and `www.yourdomain.com` if you use www
- Ensure DNS is properly configured
- Wait for SSL certificate (can take a few minutes)

## 📚 Related Documentation

- [Firebase Auth Domains](https://firebase.google.com/docs/auth/web/domain-whitelist)
- [Vercel Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- See `VERCEL_DEPLOYMENT.md` for full deployment guide

---

**After fixing**: Your Google Sign-In should work on both localhost and your Vercel deployment! 🎉

