# Splash Screen Animation Analysis

## Current Animation Flow

### Timeline Breakdown:

```
Time    | Animation Event
--------|------------------
0.0s    | Page loads, PresenceScreen appears
0.0s    | "mind" starts fading in (opacity: 0 → 1)
1.2s    | "mind" fade-in completes
1.8s    | "mind" starts sliding left (-55px)
2.1s    | "space.ai" starts fading in
2.7s    | "mind" slide completes
3.0s    | "space.ai" fade-in completes
```

### Animation Details:

1. **"mind" Fade In**
   - Duration: 1.2 seconds
   - Easing: easeOut
   - Starts immediately on mount

2. **"mind" Slide Left**
   - Delay: 1.8 seconds (after fade completes + 0.6s pause)
   - Duration: 0.9 seconds
   - Distance: -55px
   - Easing: Bezier curve [0.25, 0.1, 0.25, 1]

3. **"space.ai" Fade In**
   - Delay: 2.1 seconds (starts during "mind" slide)
   - Duration: 0.9 seconds
   - Easing: easeOut

**Total Animation Time: ~3.0 seconds**

## ⚠️ ISSUE FOUND: Auto-Navigation Conflict

### Problem:
In `App.tsx` (line 90-94), there's an auto-navigation timer:
```typescript
setTimeout(() => {
  navigate('onboarding');
}, 2000); // 2 seconds
```

**This navigates away at 2 seconds, cutting off the animation!**

- Animation needs: **3.0 seconds** to complete
- Auto-navigation happens: **2.0 seconds**
- Result: "space.ai" fade-in gets interrupted

### Solution:
Increase the auto-navigation delay to **3.5 seconds** to allow full animation to complete.

## How It Works:

1. **Component Mount**
   - `PresenceScreen` renders when `currentScreen === 'presence'`
   - Framer Motion animations start immediately

2. **Animation Sequence**
   - Both animations (opacity and x) are defined in the same `animate` prop
   - Framer Motion handles them independently based on their transition configs
   - Opacity animates immediately (0-1.2s)
   - X position waits for delay, then animates (1.8s-2.7s)

3. **Positioning**
   - "mind" is `position: relative` with `zIndex: 2` (on top)
   - "space.ai" is `position: absolute` at `left: 52%` with `zIndex: 1` (behind)
   - When "mind" slides left, it reveals "space.ai" underneath

4. **Exit Transition**
   - When `isExiting` is true, the entire screen fades out (0.5s)
   - This happens when navigating away from presence screen

## Current Timing:

| Animation | Start | End | Duration |
|-----------|-------|-----|----------|
| "mind" fade | 0.0s | 1.2s | 1.2s |
| "mind" slide | 1.8s | 2.7s | 0.9s |
| "space.ai" fade | 2.1s | 3.0s | 0.9s |
| **Auto-navigate** | **2.0s** | **2.0s** | **❌ TOO EARLY** |

## Recommended Fix:

Change auto-navigation delay from 2000ms to 3500ms to allow full animation.

