import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';

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
  // Hardcoded guest user for "no-login" mode
  const guestUser = {
    uid: 'guest_user',
    email: 'guest@mindspace.app',
    displayName: 'Guest User',
    photoURL: null,
  } as User;

  const [user] = useState<User | null>(guestUser);
  const [authLoading] = useState<boolean>(false);

  return (
    <AuthContext.Provider value={{ user, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

