import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  updateProfile,
  updateEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

// Sign up new user
export const signUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return userCredential.user;
  } catch (error: any) {
    // Handle specific Firebase errors
    let errorMessage = 'Failed to create account';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered. Please sign in instead.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    throw new Error(errorMessage);
  }
};

// Sign in existing user
export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    let errorMessage = 'Failed to sign in';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    }
    
    throw new Error(errorMessage);
  }
};

// Sign out user
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign out');
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    let errorMessage = 'Failed to send password reset email';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    throw new Error(errorMessage);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Update user profile
export const updateUserProfileData = async (displayName?: string, email?: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user is currently signed in');

  try {
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    if (email && email !== user.email) {
      await updateEmail(user, email);
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Google Sign-In using popup (better UX, no page reload)
// Falls back to redirect if popup is blocked
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    logger.debug('[Google Auth] Attempting popup sign-in...');
    
    try {
      // Try popup first (better UX - no page reload)
      const result = await signInWithPopup(auth, provider);
      logger.log('[Google Auth] Popup sign-in successful:', result.user.email);
      return result.user;
    } catch (popupError: any) {
      // If popup is blocked, fall back to redirect
      if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
        logger.debug('[Google Auth] Popup blocked, falling back to redirect...');
        await signInWithRedirect(auth, provider);
        // Redirect doesn't return - user will be handled by AuthProvider's onAuthStateChanged
        // Return a promise that never resolves (page will redirect)
        return new Promise(() => {});
      }
      throw popupError;
    }
  } catch (error: any) {
    logger.error('[Google Auth] Error during sign-in:', error);
    let errorMessage = 'Failed to sign in with Google';
    
    if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup was blocked. Please allow popups and try again.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in was cancelled.';
    }
    
    throw new Error(errorMessage);
  }
};

// NOTE: getGoogleRedirectResult is no longer needed
// AuthProvider's onAuthStateChanged handles all auth state changes automatically
// This includes redirect results - Firebase sets auth.currentUser immediately after redirect

