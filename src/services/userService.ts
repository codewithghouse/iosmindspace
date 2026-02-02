import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { adaptUserToFirestore, adaptUserFromFirestore } from '../utils/firestoreAdapter';
import { UserProfile } from '../types';

// Create user profile when they sign up (compatible with Flutter app)
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  photoUrl?: string
): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'user', uid); // Use 'user' collection (singular)
    
    // Check if profile already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return adaptUserFromFirestore({
        ...data,
        created_time: data.created_time?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      });
    }
    
    // Create new profile in Flutter-compatible format
    const userData = adaptUserToFirestore({
      uid,
      email,
      displayName,
      photoUrl,
      theme: 'dark',
      language: 'en',
      plan: 'Free Trial',
      remaining: 1200, // Default conversation seconds
      total_conversation_seconds: 0,
    });
    
    await setDoc(userRef, {
      ...userData,
      created_time: serverTimestamp(),
      updated_at: serverTimestamp(),
      is_admin: false,
    });
    
    return adaptUserFromFirestore({
      ...userData,
      created_time: new Date(),
      updated_at: new Date()
    });
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.warn('Firestore is offline, profile will be created when online.');
      return adaptUserFromFirestore({
        uid,
        email,
        display_name: displayName,
        photo_url: photoUrl || '',
        theme: 'dark',
        language: 'en',
        created_time: new Date(),
        updated_at: new Date()
      });
    }
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile (reads from Flutter app's user collection)
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'user', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const data = userSnap.data();
      return adaptUserFromFirestore({
        ...data,
        created_time: data.created_time?.toDate() || new Date(),
        updated_at: data.updated_at?.toDate() || new Date()
      });
    }
    
    return null;
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      console.warn('Firestore is offline, returning null. Will retry when online.');
      return null;
    }
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile (maintains Flutter compatibility)
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const userRef = doc(db, 'user', uid);
  const updateData: any = {
    updated_at: serverTimestamp()
  };
  
  // Map camelCase to snake_case for Flutter compatibility
  if (updates.displayName !== undefined || updates.display_name !== undefined) {
    updateData.display_name = updates.display_name || updates.displayName;
  }
  if (updates.photoUrl !== undefined || updates.photo_url !== undefined) {
    updateData.photo_url = updates.photo_url || updates.photoUrl;
  }
  if (updates.theme !== undefined) {
    updateData.theme = updates.theme;
  }
  if (updates.language !== undefined) {
    updateData.language = updates.language;
  }
  if (updates.phoneNumber !== undefined || updates.phone_number !== undefined) {
    updateData.phone_number = updates.phone_number || updates.phoneNumber;
  }
  if (updates.gender !== undefined) {
    updateData.gender = updates.gender;
  }
  if (updates.location !== undefined) {
    updateData.location = updates.location;
  }
  if (updates.plan !== undefined) {
    updateData.plan = updates.plan;
  }
  if (updates.remaining !== undefined) {
    updateData.remaining = updates.remaining;
  }
  if (updates.total_conversation_seconds !== undefined || updates.totalConversationSeconds !== undefined) {
    updateData.total_conversation_seconds = updates.total_conversation_seconds || updates.totalConversationSeconds;
  }
  
  await updateDoc(userRef, updateData);
};

