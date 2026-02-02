import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { createUserProfile, getUserProfile } from '../services/userService';
import { UserProfile } from '../types';
import { logout as firebaseLogout } from '../services/authService';
import { adaptUserFromFirestore } from '../utils/firestoreAdapter';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';

type ScreenType = 'presence' | 'onboarding' | 'email' | 'signin' | 'forgotPassword' | 'chat' | 'home' | 'call' | 'assessments' | 'booking' | 'profile' | 'journal' | 'selfcare' | 'toolsSounds' | 'articles' | 'assessmentDetail' | 'breathing' | 'insights' | 'privacy' | 'help' | 'about' | 'notifications';

interface AppStateContextType {
  currentScreen: ScreenType;
  navigate: (screen: ScreenType) => void;
  navigateToChat: () => void;
  navigateToHome: () => void;
  navigateToProfile: () => void;
  navigateToAssessments: () => void;
  navigateToAssessment: (assessmentId?: string) => void;
  navigateToBooking: () => void;
  navigateToJournal: () => void;
  navigateToSelfCare: (category?: string) => void;
  navigateToToolsSounds: (category?: string) => void;
  navigateToArticles: (category?: string) => void;
  navigateToBreathing: () => void;
  navigateToInsights: () => void;
  navigateToCall: () => void;
  refreshUserProfile: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userName: string;
  userEmail: string;
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    console.warn('useAppState called outside AppStateProvider - using default values');
    return {
      currentScreen: 'presence' as ScreenType,
      navigate: () => {},
      navigateToChat: () => {},
      navigateToHome: () => {},
      navigateToProfile: () => {},
      navigateToAssessments: () => {},
      navigateToAssessment: () => {},
      refreshUserProfile: async () => {},
      navigateToBooking: () => {},
      navigateToJournal: () => {},
      navigateToSelfCare: () => {},
      navigateToToolsSounds: () => {},
      navigateToArticles: () => {},
      navigateToBreathing: () => {},
      navigateToInsights: () => {},
      navigateToCall: () => {},
      logout: () => {},
      isAuthenticated: false,
      userName: 'User',
      userEmail: '',
      user: null,
      userProfile: null,
      isLoading: true,
    } as AppStateContextType;
  }
  return context;
};

interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * AppStateProvider - Manages navigation and user profile
 * 
 * IMPORTANT: Auth state comes from AuthProvider (single source of truth)
 * This provider only manages:
 * - Navigation state (currentScreen)
 * - User profile from Firestore (userProfile)
 * - Does NOT manage auth state (user, isAuthenticated)
 */
export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  // Get auth state from AuthProvider (SINGLE SOURCE OF TRUTH)
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('presence');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  
  const navigationRef = useRef<{ lastNavigation: number; targetScreen: ScreenType | null }>({ 
    lastNavigation: 0, 
    targetScreen: null
  });

  // Sync userProfile when user changes (from AuthProvider)
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      setIsLoadingProfile(false);
      return;
    }

    // User exists - fetch/create profile
    setIsLoadingProfile(true);
    
    const loadUserProfile = async () => {
      try {
        // Create temp profile from auth data immediately
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        const tempProfile = adaptUserFromFirestore({
          uid: user.uid,
          email: user.email || '',
          display_name: displayName,
          photo_url: user.photoURL || '',
          theme: 'dark',
          language: 'en',
          created_time: new Date(),
          updated_at: new Date()
        });
        setUserProfile(tempProfile);
        
        // Fetch or create profile from Firestore in background
        try {
          let profile = await getUserProfile(user.uid);
          
          if (!profile) {
            // Create profile if it doesn't exist
            profile = await createUserProfile(
              user.uid,
              user.email || '',
              displayName,
              user.photoURL || undefined
            );
          }
          
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error: any) {
          // If Firestore is offline, keep using temp profile
          if (error.code !== 'unavailable' && !error.message?.includes('offline')) {
            logger.error('Error fetching user profile:', error);
          }
        }
      } catch (error) {
        logger.error('Error loading user profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const getUserName = useCallback(() => {
    if (userProfile?.displayName) return userProfile.displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  }, [user, userProfile]);

  const getUserEmail = useCallback(() => {
    if (userProfile?.email) return userProfile.email;
    if (user?.email) return user.email;
    return '';
  }, [user, userProfile]);

  const navigate = useCallback((screen: ScreenType) => {
    logger.debug(`[Navigate] Attempting to navigate to: ${screen}, isAuthenticated: ${isAuthenticated}, currentScreen: ${currentScreen}`);
    
    // Prevent navigation to auth screens if user is authenticated
    if (isAuthenticated && ['presence', 'onboarding', 'email', 'signin', 'forgotPassword'].includes(screen)) {
      logger.debug(`[Navigate] BLOCKED - User is authenticated, cannot navigate to ${screen}. Redirecting to home.`);
      setCurrentScreen('home');
      return;
    }
    
    // Prevent navigation to authenticated screens if user is not authenticated  
    if (!isAuthenticated && ['home', 'chat', 'assessments', 'profile', 'journal', 'selfcare', 'toolsSounds', 'articles', 'assessmentDetail', 'breathing', 'insights', 'booking', 'call', 'privacy', 'help', 'about', 'notifications'].includes(screen)) {
      logger.debug(`[Navigate] BLOCKED - User is not authenticated, cannot navigate to ${screen}. Going to signin.`);
      setCurrentScreen('signin');
      return;
    }
    
    setCurrentScreen(screen);
    logger.debug(`[Navigate] ✅ Successfully navigated to: ${screen}`);
  }, [isAuthenticated, currentScreen]);

  const navigateToChat = useCallback(() => navigate('chat'), [navigate]);
  const navigateToHome = useCallback(() => navigate('home'), [navigate]);
  const navigateToProfile = useCallback(() => navigate('profile'), [navigate]);
  const navigateToAssessments = useCallback(() => navigate('assessments'), [navigate]);
  const navigateToAssessment = useCallback((assessmentId?: string) => {
    if (assessmentId) {
      localStorage.setItem('current_assessment_id', assessmentId);
    }
    navigate('assessmentDetail');
  }, [navigate]);
  const navigateToBooking = useCallback(() => navigate('booking'), [navigate]);
  const navigateToJournal = useCallback(() => navigate('journal'), [navigate]);
  const navigateToSelfCare = useCallback((category?: string) => {
    if (category) {
      localStorage.setItem('selfcare_category', category);
    }
    navigate('selfcare');
  }, [navigate]);
  const navigateToToolsSounds = useCallback((category?: string) => {
    if (category) {
      localStorage.setItem('tools_category', category);
    }
    navigate('toolsSounds');
  }, [navigate]);
  const navigateToArticles = useCallback((category?: string) => {
    if (category) {
      localStorage.setItem('articles_category', category);
    }
    navigate('articles');
  }, [navigate]);
  const navigateToBreathing = useCallback(() => navigate('breathing'), [navigate]);
  const navigateToInsights = useCallback(() => navigate('insights'), [navigate]);
  const navigateToCall = useCallback(() => navigate('call'), [navigate]);

  // Refresh user profile from Firestore
  const refreshUserProfile = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
        logger.debug('[AppState] User profile refreshed');
      }
    } catch (error) {
      logger.error('[AppState] Error refreshing user profile:', error);
    }
  }, [user?.uid]);

  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
      // AuthProvider will update user state, which will trigger navigation in App.tsx
      setUserProfile(null);
    } catch (error) {
      logger.error('Error signing out:', error);
    }
  }, []);

  const value: AppStateContextType = {
    currentScreen,
    navigate,
    navigateToChat,
    navigateToHome,
    navigateToProfile,
    navigateToAssessments,
    navigateToAssessment,
    navigateToBooking,
    navigateToJournal,
    navigateToSelfCare,
    navigateToToolsSounds,
    navigateToArticles,
    navigateToBreathing,
    navigateToInsights,
    navigateToCall,
    refreshUserProfile,
    logout,
    isAuthenticated,
    userName: getUserName(),
    userEmail: getUserEmail(),
    user,
    userProfile,
    isLoading: isLoadingProfile, // Only loading profile, not auth
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
