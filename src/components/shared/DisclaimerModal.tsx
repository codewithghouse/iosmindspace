import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  const { theme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onAccept();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onAccept]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector('button') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Theme-aware colors
  const bgColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(247, 245, 242, 0.95)';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const accentGradient = theme === 'dark' 
    ? 'linear-gradient(to right, #8B9A85, #7A8A75)' 
    : 'linear-gradient(to right, #8B9A85, #7A8A75)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.4)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onAccept}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 safe-top safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        <div
          className="rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 ease-out modal-enter backdrop-blur-xl border"
          style={{
            backgroundColor: bgColor,
            borderColor: borderColor,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="rounded-t-3xl px-6 py-5 flex items-center gap-3 relative"
            style={{ background: accentGradient }}
          >
            <h2
              id="disclaimer-title"
              className="text-xl font-bold text-white flex-1"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
            >
              Welcome to TARA
            </h2>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="space-y-4">
              <p
                className="leading-relaxed text-sm"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: textSecondary
                }}
              >
                Hi there! Before we begin, just a quick note:
              </p>
              
              <p
                className="leading-relaxed text-sm"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: textPrimary
                }}
              >
                <strong style={{ color: textPrimary }}>TARA is your companion</strong>, always here to listen, support, and be by your side 24/7. You can share, rant, or simply talk, knowing your privacy is respected.
              </p>
              
              <p
                className="leading-relaxed text-sm"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: textPrimary
                }}
              >
                But remember, <strong style={{ color: textPrimary }}>TARA isn't here to diagnose</strong>. AI can make mistakes sometimes. Think of TARA as a friend who complements your therapist, not a replacement for one.
              </p>
              
              <p
                className="leading-relaxed text-sm"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: textPrimary
                }}
              >
                And if you ever feel the need to connect with a real counsellor, we're here for you at{' '}
                <a 
                  href="https://mindspace.ai" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline"
                  style={{ color: accentColor }}
                >
                  mindspace.ai
                </a>.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-6 text-xs" style={{ color: textSecondary }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill={accentColor} />
              </svg>
              <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}>
                Your privacy is protected
              </span>
            </div>
          </div>

          {/* Button */}
          <div className="px-6 pb-6 pt-2">
            <button
              onClick={onAccept}
              className="w-full rounded-2xl py-4 px-4 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                background: accentGradient,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: '#FFFFFF',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

