# Firestore Security Rules Update

## Issue
The `call_logs` collection was missing from Firestore security rules, causing "Missing or insufficient permissions" errors.

## Solution
Added security rules for `call_logs` collection in `firestore.rules`.

## Rules Added

```javascript
match /call_logs/{document} {
  // Allow create if authenticated and uid/userId matches
  allow create: if request.auth != null && 
                 (request.resource.data.uid == request.auth.uid || 
                  request.resource.data.userId == request.auth.uid);
  // Allow read if authenticated and uid/userId matches
  allow read: if request.auth != null && 
                (resource.data.uid == request.auth.uid || 
                 resource.data.userId == request.auth.uid);
  // Allow update if authenticated and uid/userId matches
  allow update: if request.auth != null && 
                 (resource.data.uid == request.auth.uid || 
                  resource.data.userId == request.auth.uid);
  // Allow delete if authenticated and uid/userId matches
  allow delete: if request.auth != null && 
                 (resource.data.uid == request.auth.uid || 
                  resource.data.userId == request.auth.uid);
}
```

## How to Deploy

1. **Via Firebase Console:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `goodmind-dca62`
   - Navigate to **Firestore Database** → **Rules**
   - Copy the contents of `firestore.rules`
   - Paste and click **Publish**

2. **Via Firebase CLI:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Testing

After deploying, test that:
- ✅ Users can create their own call logs
- ✅ Users can read their own call logs
- ✅ Users can update their own call logs
- ✅ Users cannot access other users' call logs

## Notes

- The rules support both `uid` (Flutter format) and `userId` (tara-calling format) fields
- Only authenticated users can access call logs
- Users can only access call logs where `uid` or `userId` matches their Firebase Auth UID

