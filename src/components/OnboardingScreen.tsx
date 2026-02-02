import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function OnboardingScreen({ isVisible, onContinue }: { isVisible: boolean; onContinue: () => void }) {
  const [opacity, setOpacity] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      // Start fade-in immediately for faster appearance
      requestAnimationFrame(() => {
        setOpacity(1);
      });
    } else {
      setOpacity(0);
    }
  }, [isVisible]);

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? 'rgba(162, 173, 156, 0.95)' : '#7A8A7A';
  const accentLight = theme === 'dark' ? 'rgba(152, 163, 146, 0.95)' : '#6A7A6A';
  const buttonText = theme === 'dark' ? '#FFFFFF' : '#FFFFFF';

  return (
    <div
      className="absolute inset-0 h-screen w-full flex flex-col items-center justify-between px-4 sm:px-6 safe-top safe-bottom"
      style={{
        opacity: isVisible ? opacity : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        backgroundColor: bgColor,
        transition: 'opacity 0.5s ease-out',
        willChange: 'opacity'
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center max-w-sm">
          <h1
            className="text-[28px] leading-[1.6] font-light mb-8 theme-transition"
            style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textPrimary
            }}
          >
            Mindspace is a private place to talk, listen, or pause.
          </h1>

          <p
            className="text-[18px] leading-[1.7] font-light theme-transition"
            style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textSecondary
            }}
          >
            You're always in control.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center w-full mb-12 gap-8">
        <button
          onClick={onContinue}
          aria-label="Continue to create account"
          className="w-full max-w-sm py-4 px-6 rounded-full transition-all duration-300 active:scale-95 shadow-sm active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target theme-transition"
          style={{
            fontFamily: "'Fira Sans', sans-serif",
            fontWeight: 500,
            fontSize: '16px',
            letterSpacing: '0.3px',
            backgroundColor: accentColor,
            color: buttonText,
            boxShadow: theme === 'dark' 
              ? '0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(122, 138, 122, 0.3), 0 2px 8px rgba(0,0,0,0.15)'
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = accentLight;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = accentColor;
          }}
        >
          Continue
        </button>

        <p
          className="text-xs opacity-40 font-light tracking-widest theme-transition"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            color: textPrimary
          }}
        >
          No ads · No tracking · GDPR compliant
        </p>
      </div>
    </div>
  );
}
