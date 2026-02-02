import { useEffect, Suspense, lazy } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { AppStateProvider, useAppState } from './contexts/AppStateContext';
import { LoadingScreen } from './components/shared/LoadingSpinner';
import NavigationBar from './components/NavigationBar';
import SunMoonSVG from './components/SunMoonSVG';
import { getCalApi } from '@calcom/embed-react';
import { resetPassword } from './services/authService';

// Lazy load all screen components for better performance
const PresenceScreen = lazy(() => import('./components/PresenceScreen'));
const OnboardingScreen = lazy(() => import('./components/OnboardingScreen'));
const EmailScreen = lazy(() => import('./components/EmailScreen'));
const SignInScreen = lazy(() => import('./components/SignInScreen'));
const ForgotPasswordScreen = lazy(() => import('./components/ForgotPasswordScreen'));
const ChatScreen = lazy(() => import('./components/ChatScreen'));
const HomeScreen = lazy(() => import('./components/HomeScreen'));
const CallScreen = lazy(() => import('./components/CallScreen'));
const AssessmentsScreen = lazy(() => import('./components/AssessmentsScreen'));
const BookingScreen = lazy(() => import('./components/BookingScreen'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen'));
const JournalScreen = lazy(() => import('./components/JournalScreen'));
const SelfCareScreen = lazy(() => import('./components/SelfCareScreen'));
const ToolsSoundsScreen = lazy(() => import('./components/ToolsSoundsScreen'));
const ArticlesScreen = lazy(() => import('./components/ArticlesScreen'));
const AssessmentDetailScreen = lazy(() => import('./components/AssessmentDetailScreen'));
const BreathingScreen = lazy(() => import('./components/BreathingScreen'));
const InsightsScreen = lazy(() => import('./components/InsightsScreen'));
const PrivacyScreen = lazy(() => import('./components/PrivacyScreen'));
const HelpScreen = lazy(() => import('./components/HelpScreen'));
const AboutScreen = lazy(() => import('./components/AboutScreen'));
const NotificationsScreen = lazy(() => import('./components/NotificationsScreen'));

function AppContent() {
  const { theme } = useTheme();
  const { user, authLoading } = useAuth(); // SINGLE SOURCE OF TRUTH for auth
  const { currentScreen, navigate, navigateToHome, logout } = useAppState();

  // Initialize Cal.com embed globally
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({ namespace: 'appointment' });
        cal('ui', {
          hideEventTypeDetails: false,
          layout: 'month_view',
          styles: {
            branding: {
              brandColor: theme === 'dark' ? '#7A8A7A' : '#A2AD9C',
            },
          },
        });
      } catch (error) {
        console.error('Error initializing Cal.com embed:', error);
      }
    })();
  }, [theme]);

  // PART 3: ROUTING LOGIC - Simple and clear
  // Flow: Sign in → Breathing → Assessment → Home
  // If user exists → show Home/Dashboard (or Breathing/Assessments if new user)
  // If user is null → show Login flow
  useEffect(() => {
    // Don't navigate while auth is loading
    if (authLoading) return;

    if (user) {
      // User is authenticated - check onboarding flow
      if (['presence', 'onboarding', 'email', 'signin', 'forgotPassword'].includes(currentScreen)) {
        // Check onboarding flow flags
        const hasSeenBreathing = localStorage.getItem('hasSeenBreathing');
        const hasSeenInitialAssessment = localStorage.getItem('hasSeenInitialAssessment');

        // Flow: Sign in → Breathing → Assessment → Home
        if (!hasSeenBreathing) {
          // First time: go to breathing screen
          navigate('breathing');
        } else if (!hasSeenInitialAssessment) {
          // After breathing: go to assessment screen
          navigate('assessments');
        } else {
          // After assessment: go to home
          navigate('home');
        }
      }
    } else {
      // User is not authenticated - show login flow
      if (!['presence', 'onboarding', 'email', 'signin', 'forgotPassword'].includes(currentScreen)) {
        navigate('presence');
      }
    }
  }, [user, currentScreen, navigate, authLoading]);

  // Auto-navigate from presence directly to sign-in screen (skipping onboarding and email)
  // Matching Flutter app: 2000ms delay (2 seconds)
  useEffect(() => {
    // Don't auto-navigate if auth is loading or user is authenticated
    if (authLoading || user) return;

    if (currentScreen === 'presence') {
      const timer = setTimeout(() => {
        if (!user && !authLoading) { // Double-check user is still null and auth is resolved
          navigate('signin'); // Skip onboarding and email, go directly to sign-in screen
        }
      }, 2000); // 2000ms (2 seconds) - matching Flutter app

      return () => clearTimeout(timer);
    }
  }, [currentScreen, user, navigate, authLoading]);

  const handleOnboardingContinue = () => {
    navigate('email');
  };

  const handleEmailSubmit = (_email: string, _password: string) => {
    // Firebase sign up is handled in EmailScreen component
    // Navigation is handled automatically by auth state change
  };

  const handleSignIn = (_email: string, _password: string) => {
    // Firebase sign in is handled in SignInScreen component
    // Navigation is handled automatically by auth state change
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await resetPassword(email);
      console.log('Password reset email sent to:', email);
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  };



  const shouldShowNavbar = ['home', 'insights', 'profile'].includes(currentScreen);

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';

  // PART 2: BLOCK UI UNTIL AUTH RESOLVES
  // This prevents auth flicker and redirect loops
  // Must be AFTER all hooks (Rules of Hooks)
  if (authLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className="relative w-full min-h-[100dvh] safe-top safe-bottom transition-colors duration-300"
      style={{
        backgroundColor: bgColor,
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        overflowX: 'hidden'
      } as React.CSSProperties}
    >
      <Suspense fallback={<LoadingScreen />}>
        {/* Only show PresenceScreen when on presence screen */}
        {currentScreen === 'presence' && <PresenceScreen />}
        <OnboardingScreen isVisible={currentScreen === 'onboarding'} onContinue={handleOnboardingContinue} />
        <EmailScreen
          isVisible={currentScreen === 'email'}
          onContinue={handleEmailSubmit}
          onNavigateToSignIn={() => navigate('signin')}
        />
        <SignInScreen
          isVisible={currentScreen === 'signin'}
          onContinue={handleSignIn}
          onNavigateToCreateAccount={() => navigate('email')}
          onNavigateToForgotPassword={() => navigate('forgotPassword')}
        />
        <ForgotPasswordScreen
          isVisible={currentScreen === 'forgotPassword'}
          onContinue={handleForgotPassword}
          onNavigateToSignIn={() => navigate('signin')}
        />
        <ChatScreen
          isVisible={currentScreen === 'chat'}
          onBack={navigateToHome}
          onCall={() => navigate('call')}
          onNewChat={() => navigate('chat')}
          onOpenChat={(_chatId: string) => {
            navigate('chat');
          }}
        />
        <HomeScreen isVisible={currentScreen === 'home'} />
        <CallScreen
          isVisible={currentScreen === 'call'}
          onEndCall={navigateToHome}
        />
        <AssessmentsScreen
          isVisible={currentScreen === 'assessments'}
          onNavigateToAssessment={(_id?: string) => navigate('assessmentDetail')}
          onBack={() => {
            // Mark that user has seen initial assessment
            const hasSeenInitialAssessment = localStorage.getItem('hasSeenInitialAssessment');
            if (!hasSeenInitialAssessment) {
              localStorage.setItem('hasSeenInitialAssessment', 'true');
            }
            // Navigate to home after assessment
            navigateToHome();
          }}
        />
        <BookingScreen
          isVisible={currentScreen === 'booking'}
          onBack={navigateToHome}
        />
        <ProfileScreen
          isVisible={currentScreen === 'profile'}
          onBack={navigateToHome}
          onLogout={logout}
        />
        <JournalScreen
          isVisible={currentScreen === 'journal'}
          onBack={navigateToHome}
        />
        <SelfCareScreen
          isVisible={currentScreen === 'selfcare'}
          onBack={navigateToHome}
          onNavigateToChat={() => navigate('chat')}
        />
        <ToolsSoundsScreen
          isVisible={currentScreen === 'toolsSounds'}
          onBack={navigateToHome}
        />
        <ArticlesScreen
          isVisible={currentScreen === 'articles'}
          onBack={navigateToHome}
        />
        <AssessmentDetailScreen
          isVisible={currentScreen === 'assessmentDetail'}
          onComplete={() => {
            // Mark that user has seen initial assessment when they complete one
            localStorage.setItem('hasSeenInitialAssessment', 'true');
            navigate('assessments');
          }}
          onBack={() => navigate('assessments')}
        />
        <BreathingScreen
          isVisible={currentScreen === 'breathing'}
          onBack={() => {
            // Mark that user has seen breathing screen
            const hasSeenBreathing = localStorage.getItem('hasSeenBreathing');
            if (!hasSeenBreathing) {
              localStorage.setItem('hasSeenBreathing', 'true');
              // Navigate to assessment after breathing
              navigate('assessments');
            } else {
              // If already seen, go to home
              navigateToHome();
            }
          }}
        />
        <InsightsScreen
          isVisible={currentScreen === 'insights'}
          onBack={navigateToHome}
        />
        <PrivacyScreen
          isVisible={currentScreen === 'privacy'}
          onBack={() => navigate('profile')}
        />
        <HelpScreen
          isVisible={currentScreen === 'help'}
          onBack={() => navigate('profile')}
        />
        <AboutScreen
          isVisible={currentScreen === 'about'}
          onBack={() => navigate('profile')}
        />
        <NotificationsScreen
          isVisible={currentScreen === 'notifications'}
          onBack={() => navigate('profile')}
        />
      </Suspense>
      {shouldShowNavbar && (
        <NavigationBar
          currentScreen={currentScreen}
          onNavigate={(screen) => navigate(screen as any)}
        />
      )}
      <SunMoonSVG />

      {/* Hidden Cal.com booking button */}
      <button
        data-cal-namespace="appointment"
        data-cal-link="goodmind-foundation-pqjl4q/appointment"
        data-cal-config='{"layout":"month_view"}'
        style={{ display: 'none' }}
        id="cal-booking-button"
        aria-hidden="true"
      >
        Book Appointment
      </button>
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
