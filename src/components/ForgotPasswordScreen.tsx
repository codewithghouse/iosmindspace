import { useState, useEffect } from 'react';
import { validateEmail } from '../utils/validation';
import { useTheme } from '../contexts/ThemeContext';
import { resetPassword } from '../services/authService';

export default function ForgotPasswordScreen({ 
  isVisible, 
  onContinue, 
  onNavigateToSignIn 
}: { 
  isVisible: boolean; 
  onContinue: (email: string) => void; 
  onNavigateToSignIn?: () => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
      setIsSubmitted(false);
      setEmail('');
      setEmailError('');
      setSubmitError('');
      setIsLoading(false);
    }
  }, [isVisible]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    setSubmitError('');
  };

  const handleEmailBlur = () => {
    setIsFocused(false);
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSubmitted(true);
      // Call onContinue for compatibility (if needed)
      onContinue(email);
    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#5A5A5A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const bgInput = theme === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.4)';
  const bgCard = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.4)';
  const bgButton = theme === 'dark' ? accentColor : accentColor;
  const buttonText = theme === 'dark' ? '#E5E5E5' : '#F7F5F2';
  const bgError = theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 242, 242, 1)';
  const borderError = theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(254, 226, 226, 1)';

  return (
    <div
      className="absolute inset-0 h-screen w-full flex flex-col items-center justify-between px-4 sm:px-6 transition-opacity duration-1000 ease-out safe-top safe-bottom theme-transition"
      style={{
        opacity: isVisible ? opacity : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        backgroundColor: bgColor
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="text-center max-w-sm w-full">
          <h2
            className="text-[20px] font-light mb-2 tracking-wide theme-transition"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              color: textPrimary
            }}
          >
            Reset your password
          </h2>

          {!isSubmitted ? (
            <>
              <p
                className="text-sm font-light mb-12 leading-relaxed theme-transition"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: textSecondary
                }}
              >
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="w-full" aria-label="Reset password form">
                <div className="relative mb-8 transition-all duration-300">
                  <label htmlFor="email-reset" className="sr-only">Email address</label>
                  <input
                    id="email-reset"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleEmailBlur}
                    placeholder="your@email.com"
                    aria-label="Email address"
                    aria-invalid={emailError ? 'true' : 'false'}
                    aria-describedby={emailError ? 'email-error-reset' : undefined}
                    className={`w-full py-4 px-5 rounded-full border transition-all duration-300 shadow-sm touch-target theme-transition ${
                      emailError 
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : isFocused
                        ? 'opacity-100 focus:ring-2'
                        : 'opacity-80 focus:ring-1'
                    }`}
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                      fontWeight: 400,
                      fontSize: '16px',
                      letterSpacing: '0.2px',
                      WebkitAppearance: 'none',
                      appearance: 'none',
                      backgroundColor: bgInput,
                      color: textPrimary,
                      borderColor: emailError ? 'rgba(239, 68, 68, 0.6)' : (isFocused ? accentColor : borderColor)
                    }}
                  />
                  {emailError && (
                    <p id="email-error-reset" className="mt-2 text-xs text-red-500 font-light" role="alert">
                      {emailError}
                    </p>
                  )}
                </div>

                {submitError && (
                  <div className="mb-4 p-3 rounded-full border theme-transition" role="alert" style={{ backgroundColor: bgError, borderColor: borderError }}>
                    <p className="text-sm font-light text-center theme-transition" style={{ color: theme === 'dark' ? '#fca5a5' : '#dc2626' }}>
                      {submitError}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !email.trim() || !!emailError}
                  aria-label={isLoading ? 'Sending reset link...' : 'Send reset link'}
                  className={`w-full py-4 px-6 rounded-full transition-all duration-300 shadow-sm touch-target theme-transition ${
                    isLoading || !email.trim() || !!emailError
                      ? 'opacity-40 cursor-not-allowed'
                      : 'active:scale-95 active:shadow-md'
                  }`}
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    letterSpacing: '0.3px',
                    backgroundColor: bgButton,
                    color: buttonText
                  }}
                  onMouseDown={(e) => {
                    if (!isLoading && email.trim() && !emailError) {
                      e.currentTarget.style.backgroundColor = accentLight;
                    }
                  }}
                  onMouseUp={(e) => {
                    if (!isLoading && email.trim() && !emailError) {
                      e.currentTarget.style.backgroundColor = bgButton;
                    }
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="w-full">
              <div className="mb-8 p-6 rounded-full border theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
                <p
                  className="text-sm font-light leading-relaxed theme-transition"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    color: textPrimary
                  }}
                >
                  We've sent a password reset link to <span className="font-medium">{email}</span>. Please check your email.
                </p>
              </div>

              {onNavigateToSignIn && (
                <button
                  onClick={onNavigateToSignIn}
                  aria-label="Back to sign in"
                  className="w-full py-4 px-6 rounded-full active:scale-95 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 theme-transition"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    fontWeight: 400,
                    fontSize: '16px',
                    letterSpacing: '0.3px',
                    backgroundColor: bgButton,
                    color: buttonText
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgButton}
                >
                  Back to sign in
                </button>
              )}
            </div>
          )}

          {!isSubmitted && onNavigateToSignIn && (
            <button
              onClick={onNavigateToSignIn}
              aria-label="Back to sign in"
              className="mt-6 text-sm font-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1 theme-transition"
              style={{ 
                color: textSecondary,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = textPrimary}
              onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <img
          src={theme === 'dark' ? '/assets/mindspace_black.png' : '/assets/mindspace.png'}
          alt="mindspace.ai"
          className="h-5 opacity-40 theme-transition"
          style={{ transition: 'opacity 0.3s ease' }}
        />
      </div>
    </div>
  );
}

