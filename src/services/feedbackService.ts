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
import { Feedback } from '../types';

/**
 * Save feedback (compatible with Flutter app)
 */
export const saveFeedback = async (
  uid: string,
  email: string,
  feedbackText: string
): Promise<string> => {
  try {
    const userRef = getUserReference(uid);
    
    const feedbackData: Omit<Feedback, 'id'> = {
      created_at: Timestamp.now(),
      email: email,
      feedback: feedbackText,
      uid: userRef, // DocumentReference
    };
    
    const docRef = await addDoc(collection(db, 'feedback'), feedbackData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};

/**
 * Get user's feedback (real-time listener)
 */
export const subscribeToUserFeedback = (
  uid: string,
  callback: (feedback: Feedback[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  const q = query(
    collection(db, 'feedback'),
    where('uid', '==', userRef),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const feedback: Feedback[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];
    
    callback(feedback);
  }, (error) => {
    console.error('Error subscribing to feedback:', error);
    callback([]);
  });
};

/**
 * Get user's feedback (one-time)
 */
export const getUserFeedback = async (
  uid: string,
  limitCount: number = 20
): Promise<Feedback[]> => {
  try {
    const userRef = getUserReference(uid);
    
    const q = query(
      collection(db, 'feedback'),
      where('uid', '==', userRef),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];
  } catch (error: any) {
    console.error('Error getting user feedback:', error);
    throw error;
  }
};

