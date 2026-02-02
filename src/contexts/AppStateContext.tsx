import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { getUserProfile } from '../services/userService';
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
      navigate: () => { },
      navigateToChat: () => { },
      navigateToHome: () => { },
      navigateToProfile: () => { },
      navigateToAssessments: () => { },
      navigateToAssessment: () => { },
      refreshUserProfile: async () => { },
      navigateToBooking: () => { },
      navigateToJournal: () => { },
      navigateToSelfCare: () => { },
      navigateToToolsSounds: () => { },
      navigateToArticles: () => { },
      navigateToBreathing: () => { },
      navigateToInsights: () => { },
      navigateToCall: () => { },
      logout: () => { },
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

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

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
        const displayName = user.displayName || user.email?.split('@')[0] || 'Guest User';
        const tempProfile = adaptUserFromFirestore({
          uid: 'guest_user',
          email: 'guest@mindspace.app',
          display_name: displayName,
          photo_url: '',
          theme: 'dark',
          language: 'en',
          created_time: new Date(),
          updated_at: new Date()
        });
        setUserProfile(tempProfile);
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
    return 'Guest User';
  }, [user, userProfile]);

  const getUserEmail = useCallback(() => {
    if (userProfile?.email) return userProfile.email;
    if (user?.email) return user.email;
    return 'guest@mindspace.app';
  }, [user, userProfile]);

  const navigate = useCallback((screen: ScreenType) => {
    logger.debug(`[Navigate] Navigating to: ${screen}`);
    setCurrentScreen(screen);
  }, []);

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
