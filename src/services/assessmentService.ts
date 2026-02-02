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
import { AssessmentResult } from '../types';

/**
 * Save assessment result (compatible with Flutter app)
 * Uses Flutter format: DocumentReference for uid, user_email field
 */
export const saveAssessmentResult = async (
  uid: string,
  email: string,
  assessmentName: string,
  score: string,
  callDurationSeconds?: number,
  chatbotLink?: string
): Promise<string> => {
  try {
    const userRef = getUserReference(uid);
    
    // Use Flutter app format (DocumentReference for uid)
    const assessmentData = {
      uid: userRef, // DocumentReference (Flutter format)
      user_email: email, // Flutter format uses user_email
      assessment_name: assessmentName,
      score: score,
      submit_time: Timestamp.now(),
      // Optional additional fields (for compatibility with existing data)
      call_duration_seconds: callDurationSeconds,
      created_at: Timestamp.now(),
      chatbotlink: chatbotLink || 'https://goodmind-chatbot.vercel.app/',
      dateandtime: Timestamp.now(),
    };
    
    const docRef = await addDoc(collection(db, 'assessments'), assessmentData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving assessment result:', error);
    throw error;
  }
};

/**
 * Get user's assessment results (real-time listener)
 * Handles BOTH uid formats (DocumentReference and string)
 * Handles missing index gracefully by using query without orderBy
 */
export const subscribeToUserAssessments = (
  uid: string,
  callback: (assessments: AssessmentResult[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  // Use query without orderBy to avoid index requirement
  // We'll sort in memory instead
  const q = query(
    collection(db, 'assessments'),
    where('uid', '==', userRef),
    limit(limitCount * 2) // Get more to ensure we have enough after sorting
  );
  
  return onSnapshot(q, (snapshot) => {
    let assessments: AssessmentResult[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        // Support both formats
        uid: data.uid?.id || data.uid || uid,
        user_email: data.user_email || data.email || '',
        email: data.user_email || data.email || '',
        assessment_name: data.assessment_name || '',
        score: data.score || '',
        submit_time: data.submit_time || data.created_at,
        call_duration_seconds: data.call_duration_seconds,
        created_at: data.created_at || data.submit_time,
        chatbotlink: data.chatbotlink,
        dateandtime: data.dateandtime,
      };
    }) as AssessmentResult[];
    
    // Sort by submit_time in memory (descending)
    assessments.sort((a, b) => {
      const timeA = a.submit_time?.toDate ? a.submit_time.toDate().getTime() : new Date(a.submit_time || 0).getTime();
      const timeB = b.submit_time?.toDate ? b.submit_time.toDate().getTime() : new Date(b.submit_time || 0).getTime();
      return timeB - timeA; // Descending
    });
    
    // Limit after sorting
    callback(assessments.slice(0, limitCount));
  }, (error) => {
    console.error('Error subscribing to assessments:', error);
    callback([]);
  });
};

/**
 * Get user's assessment results (one-time)
 * Handles missing index gracefully by trying without orderBy first
 */
export const getUserAssessments = async (
  uid: string,
  limitCount: number = 20
): Promise<AssessmentResult[]> => {
  try {
    const userRef = getUserReference(uid);
    
    // Try with orderBy first (requires index)
    try {
      const q = query(
        collection(db, 'assessments'),
        where('uid', '==', userRef),
        orderBy('submit_time', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid?.id || data.uid || uid,
          user_email: data.user_email || data.email || '',
          email: data.user_email || data.email || '',
          assessment_name: data.assessment_name || '',
          score: data.score || '',
          submit_time: data.submit_time || data.created_at,
          call_duration_seconds: data.call_duration_seconds,
          created_at: data.created_at || data.submit_time,
          chatbotlink: data.chatbotlink,
          dateandtime: data.dateandtime,
        };
      }) as AssessmentResult[];
      
      return results;
    } catch (indexError: any) {
      // If index error, try without orderBy and sort in memory
      if (indexError.code === 'failed-precondition' && indexError.message?.includes('index')) {
        console.warn('[Assessments] Index not found, fetching without orderBy and sorting in memory');
        
        const q = query(
          collection(db, 'assessments'),
          where('uid', '==', userRef),
          limit(limitCount * 2) // Get more to ensure we have enough after sorting
        );
        
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid?.id || data.uid || uid,
            user_email: data.user_email || data.email || '',
            email: data.user_email || data.email || '',
            assessment_name: data.assessment_name || '',
            score: data.score || '',
            submit_time: data.submit_time || data.created_at,
            call_duration_seconds: data.call_duration_seconds,
            created_at: data.created_at || data.submit_time,
            chatbotlink: data.chatbotlink,
            dateandtime: data.dateandtime,
          };
        }) as AssessmentResult[];
        
        // Sort by submit_time in memory (descending)
        results.sort((a, b) => {
          const timeA = a.submit_time?.toDate ? a.submit_time.toDate().getTime() : new Date(a.submit_time || 0).getTime();
          const timeB = b.submit_time?.toDate ? b.submit_time.toDate().getTime() : new Date(b.submit_time || 0).getTime();
          return timeB - timeA; // Descending
        });
        
        return results.slice(0, limitCount);
      }
      throw indexError;
    }
  } catch (error: any) {
    console.error('Error getting user assessments:', error);
    // Return empty array instead of throwing to prevent app crash
    return [];
  }
};

