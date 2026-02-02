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
import { JournalEntry } from '../types';

/**
 * Save journal entry (compatible with Flutter app)
 */
export const saveJournalEntry = async (
  uid: string,
  email: string,
  journalEntry: string,
  description: string
): Promise<string> => {
  try {
    const userRef = getUserReference(uid);
    
    const journalData: Omit<JournalEntry, 'id'> = {
      user_email: email,
      uid: userRef, // DocumentReference for Flutter compatibility
      journal_entry: journalEntry,
      description: description,
      date_time: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'journal'), journalData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};

/**
 * Get user's journal entries (real-time listener)
 */
export const subscribeToUserJournals = (
  uid: string,
  callback: (entries: JournalEntry[]) => void,
  limitCount: number = 50
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  const q = query(
    collection(db, 'journal'),
    where('uid', '==', userRef),
    orderBy('date_time', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const entries: JournalEntry[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JournalEntry[];
    
    callback(entries);
  }, (error) => {
    console.error('Error subscribing to journals:', error);
    callback([]);
  });
};

/**
 * Get user's journal entries (one-time)
 */
export const getUserJournals = async (
  uid: string,
  limitCount: number = 50
): Promise<JournalEntry[]> => {
  try {
    const userRef = getUserReference(uid);
    
    const q = query(
      collection(db, 'journal'),
      where('uid', '==', userRef),
      orderBy('date_time', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as JournalEntry[];
  } catch (error: any) {
    console.error('Error getting user journals:', error);
    throw error;
  }
};

