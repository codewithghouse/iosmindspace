import { useState, useEffect } from 'react';
import { validateEmail } from '../utils/validation';
import { useTheme } from '../contexts/ThemeContext';
import { signIn, signInWithGoogle } from '../services/authService';
import { createUserProfile } from '../services/userService';

export default function SignInScreen({ 
  isVisible, 
  onContinue, 
  onNavigateToCreateAccount, 
  onNavigateToForgotPassword 
}: { 
  isVisible: boolean; 
  onContinue: (email: string, password: string) => void; 
  onNavigateToCreateAccount?: () => void;
  onNavigateToForgotPassword?: () => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showTooltip, setShowTooltip] = useState<{ provider: string; show: boolean }>({ provider: '', show: false });
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setOpacity(1), 100);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
      setEmail('');
      setPassword('');
      setEmailError('');
      setPasswordError('');
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
    setIsEmailFocused(false);
    if (email.trim()) {
      const validation = validateEmail(email);
      if (!validation.isValid) {
        setEmailError(validation.error || '');
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError('');
    setSubmitError('');
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

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by auth state listener
    } catch (error: any) {
      setSubmitError(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? 'rgba(162, 173, 156, 0.95)' : '#7A8A7A';
  const accentLight = theme === 'dark' ? 'rgba(152, 163, 146, 0.95)' : '#6A7A6A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(162, 173, 156, 0.4)';
  const bgInput = theme === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.9)';
  const bgButton = theme === 'dark' ? accentColor : accentColor;
  const buttonText = theme === 'dark' ? '#FFFFFF' : '#FFFFFF';
  const bgError = theme === 'dark' ? 'rgba(220, 38, 38, 0.2)' : 'rgba(254, 242, 242, 1)';
  const borderError = theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(254, 226, 226, 1)';
  const tooltipBg = theme === 'dark' ? '#2a2a2a' : '#3A3A3A';

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
              fontFamily: "'Fira Sans', sans-serif",
              color: textPrimary
            }}
          >
            Sign in
          </h2>

          <p
            className="text-sm font-light mb-12 leading-relaxed theme-transition"
            style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textSecondary
            }}
          >
            Welcome back to Mindspace.
          </p>

          <form onSubmit={handleSubmit} className="w-full" aria-label="Sign in form">
            <div className="relative mb-4 transition-all duration-300">
              <label htmlFor="email-signin" className="sr-only">Email address</label>
              <input
                id="email-signin"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={handleEmailBlur}
                placeholder="your@email.com"
                aria-label="Email address"
                aria-invalid={emailError ? 'true' : 'false'}
                aria-describedby={emailError ? 'email-error-signin' : undefined}
                className={`w-full py-4 px-5 rounded-full border transition-all duration-300 shadow-sm touch-target theme-transition ${
                  emailError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : isEmailFocused
                    ? 'opacity-100 focus:ring-2'
                    : 'opacity-80 focus:ring-1'
                }`}
                style={{
                  fontFamily: "'Fira Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  letterSpacing: '0.2px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backgroundColor: bgInput,
                  color: textPrimary,
                  borderColor: emailError ? 'rgba(239, 68, 68, 0.6)' : (isEmailFocused ? accentColor : borderColor)
                }}
              />
              {emailError && (
                <p id="email-error-signin" className="mt-2 text-xs text-red-500 font-light" role="alert">
                  {emailError}
                </p>
              )}
            </div>

            <div className="relative mb-6 transition-all duration-300">
              <label htmlFor="password-signin" className="sr-only">Password</label>
              <input
                id="password-signin"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                placeholder="Password"
                aria-label="Password"
                aria-invalid={passwordError ? 'true' : 'false'}
                aria-describedby={passwordError ? 'password-error-signin' : undefined}
                className={`w-full py-4 px-5 rounded-full border transition-all duration-300 shadow-sm touch-target theme-transition ${
                  passwordError 
                    ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : isPasswordFocused
                    ? 'opacity-100 focus:ring-2'
                    : 'opacity-80 focus:ring-1'
                }`}
                style={{
                  fontFamily: "'Fira Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: '16px',
                  letterSpacing: '0.2px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backgroundColor: bgInput,
                  color: textPrimary,
                  borderColor: passwordError ? 'rgba(239, 68, 68, 0.6)' : (isPasswordFocused ? accentColor : borderColor)
                }}
              />
              {passwordError && (
                <p id="password-error-signin" className="mt-2 text-xs text-red-500 font-light" role="alert">
                  {passwordError}
                </p>
              )}
            </div>

            {onNavigateToForgotPassword && (
              <div className="mb-8 text-right">
                <button
                  type="button"
                  onClick={onNavigateToForgotPassword}
                  aria-label="Forgot password"
                  className="text-sm font-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1 theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: textSecondary 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = textPrimary}
                  onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {submitError && (
              <div className="mb-4 p-3 rounded-full border theme-transition" role="alert" style={{ backgroundColor: bgError, borderColor: borderError }}>
                <p className="text-sm font-light text-center theme-transition" style={{ color: theme === 'dark' ? '#fca5a5' : '#dc2626' }}>
                  {submitError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim() || !!emailError || !!passwordError}
              aria-label={isLoading ? 'Signing in...' : 'Sign in'}
              className={`w-full py-4 px-6 rounded-full transition-all duration-300 shadow-sm touch-target theme-transition ${
                isLoading || !email.trim() || !password.trim() || !!emailError || !!passwordError
                  ? 'opacity-40 cursor-not-allowed'
                  : 'active:scale-95 active:shadow-md'
              }`}
              style={{
                fontFamily: "'Fira Sans', sans-serif",
                fontWeight: 500,
                fontSize: '16px',
                letterSpacing: '0.3px',
                backgroundColor: bgButton,
                color: buttonText,
                boxShadow: theme === 'dark' 
                  ? '0 4px 12px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.2)'
                  : '0 4px 16px rgba(122, 138, 122, 0.3), 0 2px 8px rgba(0,0,0,0.15)'
              }}
              onMouseDown={(e) => {
                if (!isLoading && email.trim() && password.trim() && !emailError && !passwordError) {
                  e.currentTarget.style.backgroundColor = accentLight;
                }
              }}
              onMouseUp={(e) => {
                if (!isLoading && email.trim() && password.trim() && !emailError && !passwordError) {
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center">
            <div className="flex-1 border-t theme-transition" style={{ borderColor: borderColor }}></div>
            <span className="px-4 text-xs font-light theme-transition" style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textSecondary
            }}>
              or
            </span>
            <div className="flex-1 border-t theme-transition" style={{ borderColor: borderColor }}></div>
          </div>

          <div className="w-full flex justify-center gap-3 mb-6" role="group" aria-label="Social login options">
            <div className="relative">
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    setSubmitError('');
                    // PART 4: Login page ONLY triggers sign-in
                    // AuthProvider will handle state change and navigation automatically
                    await signInWithGoogle();
                    // If popup succeeds, user is set and AuthProvider will trigger navigation
                    // If redirect, page will reload and AuthProvider will detect user
                    setIsLoading(false);
                  } catch (error: any) {
                    setSubmitError(error.message || 'Failed to sign in with Google');
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    setShowTooltip({ provider: 'google', show: true });
                    e.currentTarget.style.borderColor = accentColor;
                  }
                }}
                onMouseLeave={(e) => {
                  setShowTooltip({ provider: '', show: false });
                  e.currentTarget.style.borderColor = borderColor;
                }}
                onFocus={() => setShowTooltip({ provider: 'google', show: true })}
                onBlur={() => setShowTooltip({ provider: '', show: false })}
                aria-label="Continue with Google"
                className={`w-14 h-14 rounded-full bg-transparent border transition-all duration-300 flex items-center justify-center active:scale-95 active:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target theme-transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                style={{ borderColor: borderColor }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              {showTooltip.provider === 'google' && showTooltip.show && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-white text-xs rounded whitespace-nowrap pointer-events-none z-10 theme-transition" style={{ backgroundColor: tooltipBg }}>
                  Continue with Google
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent theme-transition" style={{ borderTopColor: tooltipBg }}></div>
                </div>
              )}
            </div>
          </div>

          {onNavigateToCreateAccount && (
            <button
              onClick={onNavigateToCreateAccount}
              aria-label="Navigate to create account page"
              className="text-sm font-light transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded px-2 py-1 theme-transition"
              style={{ 
                fontFamily: "'Fira Sans', sans-serif",
                color: textSecondary 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = textPrimary}
              onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
            >
              Create account
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

