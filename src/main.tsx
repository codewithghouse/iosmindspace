import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

// Detect iOS and add class to document for CSS targeting
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// --- DEBUG: PWA SANITIZATION CHECK ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      console.warn('⚠️ Legacy Service Worker found! Unregistering...');
      for (const registration of registrations) {
        registration.unregister();
      }
      window.location.reload();
    } else {
      console.log('✅ No Service Workers active. Running in standard web mode.');
    }
  });
}
// --------------------------------------

if (isIOS) {
  document.documentElement.classList.add("ios");
  console.log('📱 iOS Browser detected');
}

// Suppress Cal.com internal warnings (these are harmless third-party library warnings)
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  // Filter out Cal.com internal warnings that don't affect functionality
  if (
    message.includes('markdownToSafeHTML') ||
    message.includes('[DEPRECATED] Use `createWithEqualityFn`') ||
    message.includes('react-i18next:: You will need to pass in an i18next instance')
  ) {
    return; // Suppress these harmless warnings from Cal.com
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
