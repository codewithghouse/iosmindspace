# TARA Calling Integration Guide

## Overview

The React app integrates with the **TARA Calling** application (`tara-calling-main` folder) to provide voice calling functionality. The TARA calling app is a separate React application that handles the actual voice interface using ElevenLabs API.

---

## Architecture

```
┌─────────────────────┐
│   React App         │
│  (Main App)         │
└──────────┬──────────┘
           │
           │ 1. User clicks "Call TARA"
           │ 2. Get Firebase JWT token
           │ 3. Fetch TARA link from Firestore
           │
           ▼
┌─────────────────────┐
│   taraService.ts    │
│  - getTaraLink()    │
│  - getFirebaseIdToken() │
│  - launchTaraCall() │
└──────────┬──────────┘
           │
           │ Opens: ${taraLink}?auth=${jwtToken}
           │
           ▼
┌─────────────────────┐
│  TARA Calling App   │
│  (tara-calling-main)│
│  Deployed at:       │
│  tara.mindspace.ai  │
└──────────┬──────────┘
           │
           │ 1. Receives JWT token from URL
           │ 2. Calls Netlify function to verify
           │ 3. Converts to Firebase custom token
           │ 4. Signs in user automatically
           │
           ▼
┌─────────────────────┐
│  Voice Interface    │
│  (ElevenLabs API)   │
└─────────────────────┘
```

---

## How It Works

### 1. **Main App (React)**
   - User clicks "Call TARA" button anywhere in the app
   - `taraService.ts` is called:
     - Fetches latest TARA link from Firestore `tara` collection
     - Gets Firebase JWT token from authenticated user
     - Opens: `${taraLink}?auth=${jwtToken}` in new window

### 2. **TARA Calling App**
   - Receives JWT token from URL parameter `?auth=`
   - Calls Netlify serverless function: `/.netlify/functions/verify-jwt-token`
   - Serverless function:
     - Verifies JWT token
     - Converts to Firebase custom token
     - Returns custom token
   - TARA app signs in user with custom token
   - User is automatically authenticated and can start calling

---

## Firestore Structure

### `tara` Collection
```typescript
{
  tara_link: string,      // URL to TARA calling app (e.g., "https://tara.mindspace.ai")
  date_time: Timestamp    // Used for ordering (get latest)
}
```

**Query**: Get latest record ordered by `date_time` descending

---

## Implementation Details

### Service: `src/services/taraService.ts`

```typescript
// Get latest TARA link from Firestore
getTaraLink(): Promise<TaraLink | null>

// Get Firebase JWT token
getFirebaseIdToken(): Promise<string | null>

// Launch TARA with authentication
launchTaraCall(): Promise<boolean>
```

### Integration Points

1. **CallScreen.tsx** - Automatically launches TARA when screen becomes visible
2. **ChatScreen.tsx** - Call button in chat header
3. **AssessmentDetailScreen.tsx** - "Call TARA" button
4. **NavigationBar.tsx** - Call button in navigation
5. **HomeHeader.tsx** - Call button in home header

---

## TARA Calling App Structure

### Location
- **Folder**: `tara-calling-main/`
- **Deployed URL**: Stored in Firestore `tara` collection (`tara_link` field)

### Key Features
- **Voice Interface**: Uses ElevenLabs React SDK (`@11labs/react`)
- **Authentication**: Auto-login with JWT token via URL parameter
- **Subscription Management**: Three-tier plans (Basic/Pro/Premium)
- **Payment Integration**: Razorpay payment gateway
- **Call Logging**: Saves call history to Firestore `call_logs` collection
- **Usage Tracking**: Monitors remaining minutes from `user.remaining`

### Authentication Flow

```typescript
// In tara-calling-main/src/App.tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const jwtToken = urlParams.get('auth');
  
  if (jwtToken) {
    autoLoginWithJWT(jwtToken).then((result) => {
      if (result.success) {
        // User is authenticated, can start calling
      }
    });
  }
}, []);
```

### Serverless Function (Netlify)

The TARA calling app requires a Netlify serverless function to verify JWT tokens:

**Path**: `/.netlify/functions/verify-jwt-token`

**Function**: Converts Firebase JWT token to Firebase custom token

**Note**: This function must be deployed with the TARA calling app on Netlify

---

## Deployment

### TARA Calling App Deployment

1. **Deploy to Netlify** (recommended) or Vercel
2. **Set Environment Variables**:
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_AGENT_ID`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_RAZORPAY_KEY_ID`
   - Firebase Admin SDK credentials (for serverless function)

3. **Update Firestore**:
   - Add/update `tara` collection with deployed URL:
   ```javascript
   {
     tara_link: "https://tara.mindspace.ai",  // Your deployed URL
     date_time: Timestamp.now()
   }
   ```

### Main App Integration

No additional deployment needed - the main app already has:
- ✅ `taraService.ts` - Service to fetch TARA link and launch
- ✅ All UI components updated to use the service
- ✅ Error handling and fallback URLs

---

## Testing

### Test Flow

1. **Ensure TARA link exists in Firestore**:
   ```javascript
   // In Firebase Console or via code
   await addDoc(collection(db, 'tara'), {
     tara_link: 'https://tara.mindspace.ai',
     date_time: Timestamp.now()
   });
   ```

2. **Test in Main App**:
   - Click "Call TARA" button
   - Should open TARA calling app in new window
   - Should automatically authenticate user
   - Should show voice interface

3. **Verify Authentication**:
   - Check browser console for JWT token
   - Check TARA app console for auto-login success
   - User should be signed in automatically

---

## Troubleshooting

### Issue: TARA link not found
**Solution**: Ensure `tara` collection exists in Firestore with at least one document

### Issue: Authentication fails
**Solution**: 
- Verify Firebase JWT token is valid
- Check Netlify serverless function is deployed
- Verify Firebase Admin SDK credentials are correct

### Issue: TARA app doesn't open
**Solution**:
- Check browser popup blocker settings
- Verify `tara_link` URL is correct in Firestore
- Check browser console for errors

### Issue: User not authenticated in TARA app
**Solution**:
- Verify JWT token is being passed correctly in URL
- Check Netlify function logs
- Verify Firebase project IDs match between apps

---

## Security Notes

1. **JWT Tokens**: Tokens are passed via URL (visible in browser history)
   - Tokens expire after 1 hour
   - Consider using postMessage API for more secure token passing (future enhancement)

2. **CORS**: Ensure TARA calling app allows requests from main app domain

3. **Firebase Rules**: Both apps should have proper Firestore security rules

---

## Future Enhancements

1. **Embedded Calling**: Instead of opening new window, embed TARA calling interface in iframe
2. **PostMessage API**: Use postMessage for more secure token passing
3. **Call State Sync**: Sync call state between main app and TARA app
4. **Unified Authentication**: Share authentication state between apps

---

## Related Files

- **Main App**:
  - `src/services/taraService.ts` - TARA service
  - `src/components/CallScreen.tsx` - Call screen component
  - `src/types/index.ts` - TaraLink interface

- **TARA Calling App**:
  - `tara-calling-main/src/App.tsx` - Main app component
  - `tara-calling-main/src/hooks/useAuth.ts` - Authentication hook
  - `tara-calling-main/src/components/VoiceInterface.tsx` - Voice interface
  - `tara-calling-main/netlify/functions/verify-jwt-token.js` - Serverless function

---

## Summary

✅ **Integration Complete**: Main app can launch TARA calling app with authentication
✅ **Service Created**: `taraService.ts` handles all TARA-related operations
✅ **UI Updated**: All call buttons use the new service
✅ **Error Handling**: Graceful fallback if service fails
✅ **Documentation**: This guide explains the complete integration

The integration matches the Flutter app's behavior and provides seamless authentication between the main app and TARA calling app.

