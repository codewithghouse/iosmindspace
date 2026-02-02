import { doc, DocumentReference } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Convert user UID string to DocumentReference for Flutter compatibility
 */
export const getUserReference = (uid: string): DocumentReference => {
  return doc(db, 'user', uid);
};

/**
 * Extract UID from DocumentReference
 */
export const getUidFromReference = (ref: DocumentReference | string): string => {
  if (typeof ref === 'string') return ref;
  return ref.id;
};

/**
 * Convert React camelCase UserProfile to Flutter snake_case format
 */
export const adaptUserToFirestore = (user: {
  uid: string;
  email: string;
  displayName?: string;
  display_name?: string;
  photoUrl?: string;
  photo_url?: string;
  theme?: 'light' | 'dark';
  language?: string;
  phone_number?: string;
  gender?: string;
  location?: string;
  plan?: string;
}) => {
  return {
    uid: user.uid,
    email: user.email,
    display_name: user.display_name || user.displayName || '',
    photo_url: user.photo_url || user.photoUrl || '',
    theme: user.theme || 'dark',
    language: user.language || 'en',
    phone_number: user.phone_number || '',
    gender: user.gender || '',
    location: user.location || '',
    plan: user.plan || 'Free Trial',
    // Preserve existing fields if updating
  };
};

/**
 * Convert Firestore snake_case UserProfile to React camelCase format
 */
export const adaptUserFromFirestore = (data: any) => {
  return {
    uid: data.uid || '',
    email: data.email || '',
    displayName: data.display_name || data.displayName || '',
    display_name: data.display_name || data.displayName || '',
    photoUrl: data.photo_url || data.photoUrl || '',
    photo_url: data.photo_url || data.photoUrl || '',
    created_time: data.created_time || data.createdAt,
    createdAt: data.created_time || data.createdAt,
    phone_number: data.phone_number || '',
    phoneNumber: data.phone_number || '',
    gender: data.gender || '',
    location: data.location || '',
    remaining: data.remaining || 0,
    total_conversation_seconds: data.total_conversation_seconds || 0,
    totalConversationSeconds: data.total_conversation_seconds || 0,
    plan: data.plan || 'Free Trial',
    is_admin: data.is_admin || false,
    isAdmin: data.is_admin || false,
    theme: data.theme || 'dark',
    language: data.language || 'en',
    updated_at: data.updated_at || data.updatedAt,
    updatedAt: data.updated_at || data.updatedAt,
  };
};

