# TARA Call Flow Documentation

## Complete Call Flow from Start to End

This document explains the complete flow of how a user initiates, conducts, and ends a call with TARA.

---

## 📋 Table of Contents

1. [Call Initiation](#1-call-initiation)
2. [Pre-Call Checks](#2-pre-call-checks)
3. [Call Connection](#3-call-connection)
4. [During Call](#4-during-call)
5. [Call Ending](#5-call-ending)
6. [Data Updates](#6-data-updates)

---

## 1. Call Initiation

### Entry Points

Users can start a call from multiple places in the app:

1. **Home Screen** - "Call" button in header (`HomeHeader.tsx`)
2. **Navigation Bar** - "Call" button (`NavigationBar.tsx`)
3. **Chat Screen** - "Start voice call with TARA" button (`ChatScreen.tsx`)
4. **Assessment Detail Screen** - "Call TARA" button (`AssessmentDetailScreen.tsx`)

### Navigation

All entry points call:
```typescript
navigateToCall() // From AppStateContext
```

This navigates to the `call` screen, which renders `CallScreen.tsx`.

---

## 2. Pre-Call Checks

When `CallScreen` becomes visible, it performs several checks:

### 2.1 Disclaimer Check

**Location**: `CallScreen.tsx` (lines 186-191)

```typescript
// Show disclaimer on first visit
useEffect(() => {
  if (isVisible && !hasSeenDisclaimer) {
    setShowDisclaimerModal(true);
  }
}, [isVisible, hasSeenDisclaimer]);
```

- **First-time users**: Shows `DisclaimerModal` explaining TARA's role
- **Returning users**: Skips if `hasSeenTaraDisclaimer` is in localStorage
- **User action**: Must click "I Understand, Continue" to proceed

### 2.2 Usage Check

**Location**: `CallScreen.tsx` (lines 208-227)

```typescript
const startCall = async () => {
  // Check if user has seen disclaimer
  if (!hasSeenDisclaimer) {
    setShowDisclaimerModal(true);
    return;
  }

  // Check if user can start call
  if (hasSeenDisclaimer && canStartCall()) {
    await startVoiceCall();
    return;
  }

  // Show subscription modal if no remaining time
  setShowSubscriptionModal(true);
};
```

**Checks performed**:
- Loads user usage from Firestore (`user` collection)
- Checks `remaining` field (in seconds)
- If `remaining > 0`: Proceed to call
- If `remaining <= 0`: Show `SubscriptionModal` to purchase more time

**Data Source**: 
- `useUserUsage` hook → `usageService.ts` → Firestore `user` collection
- Fields checked: `remaining`, `total_conversation_seconds`

### 2.3 Subscription Modal (if needed)

**Location**: `SubscriptionModal.tsx`

If user has no remaining time:
- Shows available plans:
  - Free Trial: 20 min (₹0)
  - Basic: 40 min (₹249)
  - Pro: 200 min (₹1150)
  - Premium: 400 min (₹2250)
- User selects plan
- For paid plans: Razorpay payment gateway opens
- After payment: Updates `user.remaining` and `user.plan` in Firestore
- Then proceeds to start call

---

## 3. Call Connection

### 3.1 Microphone Permission

**Location**: `CallScreen.tsx` (lines 230-255)

```typescript
const startVoiceCall = async () => {
  // Request microphone permission if not already granted
  if (!permissionGranted && navigator?.mediaDevices?.getUserMedia) {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
    } catch (err) {
      setPermissionGranted(false);
      console.log('Proceeding without microphone access');
    }
  }

  const agentId = import.meta.env.VITE_AGENT_ID;
  if (!agentId) {
    throw new Error('Agent ID not configured');
  }

  await conversation.startSession({
    agentId: agentId,
  });
};
```

**Steps**:
1. Request browser microphone permission
2. Get ElevenLabs Agent ID from environment variables
3. Start ElevenLabs conversation session

### 3.2 ElevenLabs Connection

**Location**: `CallScreen.tsx` (lines 44-80)

Uses `@11labs/react` hook:

```typescript
const conversation = useConversation({
  onConnect: () => {
    setIsConnected(true);
    setIsTimerRunning(true);
    setConversationTime(0);
    setCurrentCallLogId(null);
  },
  onDisconnect: () => {
    // Handle disconnect
  },
  onError: (error) => {
    // Handle errors
  }
});
```

**When connected**:
- `onConnect` callback fires
- Sets `isConnected = true`
- Starts timer (`isTimerRunning = true`)
- Resets conversation time to 0
- UI updates to show "Call Active" state

---

## 4. During Call

### 4.1 Timer & Usage Tracking

**Location**: `CallScreen.tsx` (lines 107-146)

```typescript
useEffect(() => {
  if (isTimerRunning) {
    timerRef.current = setInterval(() => {
      setConversationTime(prev => {
        const newTime = prev + 1;
        
        // Update usage every 10 seconds
        if (newTime % 10 === 0) {
          updateUserUsage(10); // Updates Firestore
          
          // Update call log every 10 seconds
          updateCallLog(currentCallLogId, newTime, user.uid, user.email);
        }
        
        return newTime;
      });
    }, 1000);
  }
}, [isTimerRunning, updateUserUsage, user?.uid, user?.email, currentCallLogId]);
```

**What happens every second**:
1. Increments `conversationTime` by 1
2. Updates UI to show call duration (MM:SS format)

**What happens every 10 seconds**:
1. **Usage Update**: Calls `updateUserUsage(10)`
   - Updates Firestore `user` collection:
     - `total_conversation_seconds += 10`
     - `remaining -= 10`
   - Reloads usage data to update UI
   
2. **Call Log Update**: Calls `updateCallLog()`
   - Creates or updates `call_logs` collection document
   - Stores: `uid`, `email`, `call_duration_seconds`, `created_at`
   - Returns `callLogId` for future updates

### 4.2 Auto-End on Time Limit

**Location**: `CallScreen.tsx` (lines 165-184)

```typescript
// Check remaining time and auto-end call if needed
useEffect(() => {
  if (isConnected && usage && usage.remaining_seconds <= 0) {
    console.log('⏰ Time limit reached! Auto-ending call...');
    endCall();
  }
}, [usage?.remaining_seconds, isConnected]);

// Check every second during active calls
useEffect(() => {
  if (!isConnected || !usage) return;
  
  const checkInterval = setInterval(() => {
    if (usage.remaining_seconds <= 0) {
      endCall();
    }
  }, 1000);
  
  return () => clearInterval(checkInterval);
}, [isConnected, usage?.remaining_seconds]);
```

**Protection**:
- Checks remaining time every second
- If `remaining_seconds <= 0`: Automatically ends call
- Prevents users from exceeding their plan limits

### 4.3 Call Controls

**Available during call**:
- **Mute/Unmute**: Toggles microphone (via ElevenLabs SDK)
- **Speaker**: Controls audio output
- **End Call**: Manually ends the call

---

## 5. Call Ending

### 5.1 Manual End

**Location**: `CallScreen.tsx` (lines 257-275)

```typescript
const endCall = async () => {
  try {
    setIsTimerRunning(false); // Stop timer
    
    // Save final call log
    if (user?.uid && user?.email && conversationTime > 0) {
      updateCallLog(currentCallLogId, conversationTime, user.uid, user.email);
    }
    
    await conversation.endSession(); // Disconnect from ElevenLabs
  } catch (error) {
    console.error('Failed to end conversation:', error);
  }
};
```

**Steps**:
1. Stop timer
2. Save final call log with total duration
3. End ElevenLabs session
4. `onDisconnect` callback fires
5. Navigate back to home screen

### 5.2 Auto-End (Time Limit)

Same as manual end, but triggered automatically when `remaining_seconds <= 0`.

### 5.3 Error/Disconnect

**Location**: `CallScreen.tsx` (lines 52-79)

```typescript
onDisconnect: () => {
  setIsConnected(false);
  setIsTimerRunning(false);
  
  // Save final call log
  if (user?.uid && user?.email && conversationTime > 0) {
    updateCallLog(currentCallLogId, conversationTime, user.uid, user.email);
  }
  
  onEndCall(); // Navigate back
},
onError: (error) => {
  setIsTimerRunning(false);
  
  // Save call log even on error
  if (user?.uid && user?.email && conversationTime > 0) {
    updateCallLog(currentCallLogId, conversationTime, user.uid, user.email);
  }
  
  onEndCall(); // Navigate back
}
```

**Handles**:
- Network disconnections
- ElevenLabs API errors
- Browser/tab close (via `beforeunload` event)

### 5.4 Browser Close Protection

**Location**: `CallScreen.tsx` (lines 148-163)

```typescript
useEffect(() => {
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    if (isConnected && conversationTime > 0 && user?.uid && user?.email) {
      updateCallLog(currentCallLogId, conversationTime, user.uid, user.email);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [isConnected, conversationTime, user?.uid, user?.email, currentCallLogId]);
```

**Protection**:
- Saves call log before browser/tab closes
- Ensures data isn't lost if user closes browser during call

---

## 6. Data Updates

### 6.1 User Usage (Firestore: `user` collection)

**Updated every 10 seconds during call**:

```typescript
// Fields updated:
{
  total_conversation_seconds: number,  // += 10 every 10 seconds
  remaining: number,                    // -= 10 every 10 seconds
  updated_at: Timestamp
}
```

**Service**: `usageService.ts` → `updateUserUsage()`

### 6.2 Call Logs (Firestore: `call_logs` collection)

**Created/Updated every 10 seconds**:

```typescript
// Document structure:
{
  uid: string,                    // User ID
  email: string,                  // User email
  call_duration_seconds: number,  // Current call duration
  created_at: Timestamp          // Call start time
}
```

**Service**: `callLogService.ts` → `updateCallLog()`

**Note**: Call logs are optional - errors are handled silently to not interrupt the call experience.

### 6.3 Final Updates on Call End

When call ends:
1. **Final usage update**: Last 10-second increment (if any)
2. **Final call log**: Total duration saved
3. **Usage reload**: Refreshes remaining time in UI

---

## 📊 Data Flow Diagram

```
User Clicks "Call TARA"
         ↓
   Navigate to Call Screen
         ↓
   Check Disclaimer (first time?)
         ↓
   Check Remaining Time
         ↓
   ┌─────────────────┐
   │ Has Time?       │
   └────────┬────────┘
            │
    ┌───────┴────────┐
    │                │
   YES              NO
    │                │
    │         Show Subscription Modal
    │                │
    │         User Purchases Plan
    │                │
    │         Update Firestore (remaining, plan)
    │                │
    └────────┬───────┘
             │
    Request Microphone Permission
             │
    Connect to ElevenLabs (Agent ID)
             │
    ┌────────▼────────┐
    │  Call Active    │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Every Second:   │
    │ - Increment timer│
    │ - Check remaining│
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Every 10 Seconds:│
    │ - Update usage   │
    │ - Update call log│
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │ Call Ends:      │
    │ - Save final log│
    │ - End session    │
    │ - Navigate home │
    └─────────────────┘
```

---

## 🔑 Key Components

### Services

1. **`usageService.ts`**
   - `loadUserUsage()` - Loads from Firestore
   - `updateUserUsage()` - Updates every 10 seconds
   - `canStartCall()` - Checks if user has remaining time

2. **`callLogService.ts`**
   - `updateCallLog()` - Creates/updates call log document
   - Handles both Flutter format (`uid`) and tara-calling format (`userId`)

3. **`subscriptionService.ts`**
   - `updateSubscription()` - Updates plan and remaining time after payment

### Hooks

1. **`useUserUsage`**
   - Manages usage state
   - Provides `canStartCall()`, `formatRemainingTime()`, etc.

2. **`useConversation`** (from `@11labs/react`)
   - Manages ElevenLabs voice connection
   - Handles connect/disconnect/error events

### Components

1. **`CallScreen.tsx`** - Main call interface
2. **`SubscriptionModal.tsx`** - Plan selection and payment
3. **`DisclaimerModal.tsx`** - First-time user disclaimer

---

## 🔐 Environment Variables Required

```env
VITE_AGENT_ID=your_elevenlabs_agent_id
VITE_RAZORPAY_KEY_ID=rzp_live_... or rzp_test_...
```

---

## 📝 Firestore Collections Used

1. **`user`** (collection)
   - Fields: `remaining`, `total_conversation_seconds`, `plan`

2. **`call_logs`** (collection)
   - Fields: `uid`, `email`, `call_duration_seconds`, `created_at`

3. **`tara_subscription`** (collection)
   - Subscription purchase records

---

## ⚠️ Important Notes

1. **Usage updates are incremental**: Every 10 seconds, not at the end
2. **Call logs are optional**: Errors don't interrupt the call
3. **Auto-end protection**: Call automatically ends when time runs out
4. **Browser close protection**: Saves data before page unloads
5. **Real-time updates**: Usage data refreshes every 10 seconds to show accurate remaining time

---

## 🐛 Error Handling

- **Microphone permission denied**: Call proceeds (may affect audio quality)
- **ElevenLabs connection fails**: Shows error, navigates back
- **Firestore errors**: Handled silently for call logs, logged for usage
- **Network errors**: Call continues, retries on next update cycle

---

This completes the call flow documentation. The system is designed to be resilient, with multiple safety checks and graceful error handling throughout the process.

