# PWA Re-introduction & iOS Stability Plan

This document outlines the step-by-step approach to re-enabling PWA features after ensuring the iOS responsive web layout is stable.

## Phase 1: iOS Layout Validation (Current)
The app is currently a **Standard Responsive Web App**. Confirm the following behaviors in iOS Safari:
- [ ] Bottom padding is consistent with the iOS Home Indicator.
- [ ] Visual artifacts (like 100vh jumping) are resolved using `100dvh`.
- [ ] Standard browser navigation (address bar appearing/disappearing) doesn't break the layout.
- [ ] Input focus doesn't cause the screen to jump or hide the input behind the keyboard.

## Phase 2: Incremental PWA Re-introduction
Once Phase 1 is confirmed stable, follow these steps one-by-one:

### Step 1: Manifest Re-addition
1. Create a minimal `public/manifest.json`.
2. Add `<link rel="manifest" href="/manifest.json" />` back to `index.html`.
3. Set `display: standalone` but **DO NOT** add service worker yet.
4. **Test:** Verify the "Add to Home Screen" option appears and the app opens in a separate window.

### Step 2: Safe Area & Status Bar Tuning
1. In `index.html`, add:
   ```html
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   ```
2. **Test:** Verify the content flows correctly under the notch and status bar. Adjust `safe-top` padding if needed.

### Step 3: Service Worker (No Caching)
1. Re-install `vite-plugin-pwa`.
2. Configure it with `injectRegister: 'auto'` but with a **null/minimal caching strategy**.
3. **Test:** Verify registration works in DevTools → Application → Service Workers.

### Step 4: Selective Caching (Offline Support)
1. Gradually add `runtimeCaching` rules for static assets (fonts, images).
2. **One Change → One Test:** Deploy and verify on a real device.
3. If "stale cache" issues occur, implement a version-based clearing mechanism in the Service Worker.

## Preventing Cache Regressions
- **Cache Versioning:** Always increment a version string in the Service Worker when deploying breaking UI changes.
- **Cache-Busting URLs:** Vite handles this automatically for JS/CSS, but manual assets (images in `public/`) should have query params like `?v=1.0.1` if they change often.
- **Forced Update UI:** When a new Service Worker is found, show a "New version available" toast rather than auto-reloading.

---
**Goal reached:** A stable foundation for iOS layouts before introducing the complexity of PWA caching.
