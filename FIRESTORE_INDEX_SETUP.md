# Firestore Index Setup Guide

## Required Indexes for React App

The React app requires several composite indexes for efficient queries. Some indexes may already exist from your Flutter app, but you need to ensure all are created.

---

## Quick Setup (Recommended)

### Option 1: Use the provided index file

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `goodmind-dca62`
3. Navigate to **Firestore Database** → **Indexes**
4. Click **"Add Index"** or use the **firestore.indexes.json** file I created

### Option 2: Create indexes manually

Click the links below to create each index directly:

---

## Required Indexes

### 1. Assessments Collection
**Index for**: `uid` + `submit_time`

**Create Index**: [Click here to create](https://console.firebase.google.com/v1/r/project/goodmind-dca62/firestore/indexes?create_composite=ClJwcm9qZWN0cy9nb29kbWluZC1kY2E2Mi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYXNzZXNzbWVudHMvaW5kZXhlcy9fEAEaBwoDdWlkEAEaDwoLc3VibWl0X3RpbWUQAhoMCghfX25hbWVfXxAC)

**Fields**:
- `uid` (Ascending)
- `submit_time` (Descending)

**Status**: ⚠️ **REQUIRED** - Currently missing

---

### 2. Call Logs Collection (tara-calling format)
**Index for**: `userId` + `timestamp`

**Fields**:
- `userId` (Ascending)
- `timestamp` (Descending)

**Status**: ✅ May already exist

---

### 3. Call Logs Collection (Flutter format)
**Index for**: `uid` + `created_at`

**Fields**:
- `uid` (Ascending)
- `created_at` (Descending)

**Status**: ✅ May already exist

---

### 4. Conversations Collection
**Index for**: `uid` + `created_at`

**Fields**:
- `uid` (Ascending)
- `created_at` (Descending)

**Status**: ⚠️ **REQUIRED** if using conversations feature

---

### 5. Feedback Collection
**Index for**: `uid` + `created_at`

**Fields**:
- `uid` (Ascending)
- `created_at` (Descending)

**Status**: ⚠️ **REQUIRED** if using feedback feature

---

### 6. Tara Subscription Collection
**Index for**: `user_ref` + `dateandtime`

**Fields**:
- `user_ref` (Ascending)
- `dateandtime` (Descending)

**Status**: ⚠️ **REQUIRED** if using subscription feature

---

## Already Existing Indexes (from Flutter app)

These indexes should already exist:

✅ **mood_tracker**: `uid` (asc) + `date_time` (desc)
✅ **journal**: `uid` (asc) + `date_time` (desc)
✅ **user**: `plan` (asc) + `created_time` (desc)

---

## Temporary Workaround

**Good News**: I've updated the code to handle missing indexes gracefully:

1. **assessmentService.ts**: Now tries query without `orderBy` if index is missing, then sorts in memory
2. **ProfileScreen.tsx**: Uses `Promise.allSettled` to handle individual query errors gracefully

**The app will work without indexes**, but it will be slower for large datasets. Creating the indexes is recommended for better performance.

---

## How to Create Indexes

### Method 1: Via Firebase Console (Easiest)

1. Click the error link in your browser console
2. Firebase will show a "Create Index" button
3. Click it and wait for index to build (usually 1-2 minutes)

### Method 2: Via firestore.indexes.json

1. I've created a `firestore.indexes.json` file in your project root
2. Deploy it using Firebase CLI:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Method 3: Manual Creation

1. Go to Firebase Console → Firestore → Indexes
2. Click "Add Index"
3. Select collection: `assessments`
4. Add fields:
   - Field: `uid`, Order: Ascending
   - Field: `submit_time`, Order: Descending
5. Click "Create"

---

## Index Build Time

- **Small collections** (< 1000 docs): ~30 seconds
- **Medium collections** (1K-10K docs): 1-2 minutes
- **Large collections** (> 10K docs): 5-10 minutes

You'll receive an email when indexes are ready.

---

## Current Status

✅ **Working without indexes**: App handles missing indexes gracefully
⚠️ **Performance**: Queries will be slower until indexes are created
✅ **No crashes**: App continues to work even with missing indexes

---

## Priority Indexes

**High Priority** (for ProfileScreen):
1. ✅ Assessments: `uid` + `submit_time` - **REQUIRED NOW**
2. ⚠️ Call Logs: `userId` + `timestamp` - Recommended
3. ⚠️ Journals: Already exists ✅

**Medium Priority** (for future features):
4. Conversations: `uid` + `created_at`
5. Feedback: `uid` + `created_at`
6. Subscriptions: `user_ref` + `dateandtime`

---

## Verification

After creating indexes, check:
1. Firebase Console → Firestore → Indexes
2. Look for "Enabled" status
3. Test the ProfileScreen - should load faster

---

**Note**: The app will work without these indexes, but creating them will improve performance significantly.

