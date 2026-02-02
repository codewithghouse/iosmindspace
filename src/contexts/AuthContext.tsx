import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * SINGLE SOURCE OF TRUTH for authentication state
 * 
 * Rules:
 * - Only ONE onAuthStateChanged listener in entire app
 * - Blocks UI until auth state is resolved
 * - No manual navigation - let App.tsx handle routing based on user state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set session persistence FIRST
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        logger.debug('[AuthProvider] Session persistence set to local');
      })
      .catch((error) => {
        logger.error('[AuthProvider] Error setting persistence:', error);
      });

    // SINGLE onAuthStateChanged listener - this is the ONLY place auth state is checked
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      logger.debug('[AuthProvider] Auth state changed:', firebaseUser ? `User: ${firebaseUser.email}` : 'No user');
      
      setUser(firebaseUser);
      setAuthLoading(false); // Auth state resolved
    });

    // Cleanup on unmount
    return () => {
      logger.debug('[AuthProvider] Cleaning up auth listener');
      unsubscribe();
    };
  }, []); // Empty deps - only run once on mount

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

