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
import { Conversation } from '../types';

/**
 * Save conversation (voice call transcript)
 */
export const saveConversation = async (
  uid: string,
  email: string,
  body: string,
  title: string,
  createdBy: string
): Promise<string> => {
  try {
    const userRef = getUserReference(uid);
    
    const conversationData: Omit<Conversation, 'id'> = {
      created_at: Timestamp.now(),
      email: email,
      uid: userRef, // DocumentReference
      body: body,
      created_by: createdBy,
      num_sent: 0,
      status: 'pending',
      target: 'user',
      title: title,
    };
    
    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

/**
 * Get user's conversations (real-time listener)
 */
export const subscribeToUserConversations = (
  uid: string,
  callback: (conversations: Conversation[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  const q = query(
    collection(db, 'conversations'),
    where('uid', '==', userRef),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];
    
    callback(conversations);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
    callback([]);
  });
};

/**
 * Get user's conversations (one-time)
 */
export const getUserConversations = async (
  uid: string,
  limitCount: number = 20
): Promise<Conversation[]> => {
  try {
    const userRef = getUserReference(uid);
    
    const q = query(
      collection(db, 'conversations'),
      where('uid', '==', userRef),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];
  } catch (error: any) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

