import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserReference } from '../utils/firestoreAdapter';
import { MoodTracker } from '../types';
import { logger } from '../utils/logger';

/**
 * Save mood entry (compatible with Flutter app)
 */
export const saveMood = async (
  uid: string,
  email: string,
  mood: string,
  emoji: string
): Promise<string> => {
  try {
    const userRef = getUserReference(uid);
    
    const moodData: Omit<MoodTracker, 'id'> = {
      emoji,
      mood,
      date_time: Timestamp.now(),
      uid: userRef, // DocumentReference for Flutter compatibility
      user_email: email,
    };
    
    const docRef = await addDoc(collection(db, 'mood_tracker'), moodData);
    logger.log('[moodService] Mood saved:', { mood, emoji, id: docRef.id });
    return docRef.id;
  } catch (error: any) {
    logger.error('[moodService] Error saving mood:', error);
    throw error;
  }
};

/**
 * Get user's mood history (real-time listener)
 */
export const subscribeToUserMoods = (
  uid: string,
  callback: (moods: MoodTracker[]) => void,
  limitCount: number = 30
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  const q = query(
    collection(db, 'mood_tracker'),
    where('uid', '==', userRef),
    orderBy('date_time', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const moods: MoodTracker[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodTracker[];
    
    callback(moods);
  }, (error) => {
    logger.error('[moodService] Error subscribing to moods:', error);
    callback([]);
  });
};

/**
 * Get user's mood history (one-time)
 */
export const getUserMoods = async (
  uid: string,
  limitCount: number = 30
): Promise<MoodTracker[]> => {
  try {
    const userRef = getUserReference(uid);
    
    const q = query(
      collection(db, 'mood_tracker'),
      where('uid', '==', userRef),
      orderBy('date_time', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MoodTracker[];
  } catch (error: any) {
    logger.error('[moodService] Error getting user moods:', error);
    throw error;
  }
};

/**
 * Get today's mood for a user
 */
export const getTodayMood = async (uid: string): Promise<MoodTracker | null> => {
  try {
    const userRef = getUserReference(uid);
    
    // Get start and end of today
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const q = query(
      collection(db, 'mood_tracker'),
      where('uid', '==', userRef),
      where('date_time', '>=', startTimestamp),
      where('date_time', '<=', endTimestamp),
      orderBy('date_time', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as MoodTracker;
  } catch (error: any) {
    logger.error('[moodService] Error getting today mood:', error);
    return null;
  }
};

