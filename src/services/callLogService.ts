import { 
  collection, 
  addDoc, 
  doc,
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { CallLog, CallMessage } from '../types';

/**
 * Save call log (tara-calling app format)
 * This is different from Flutter's call_logs structure
 */
export const saveCallLog = async (
  userId: string,
  callId: string,
  duration: number,
  messages: CallMessage[],
  startTime: Date,
  endTime: Date
): Promise<string> => {
  try {
    const callLogData: Omit<CallLog, 'id'> = {
      callId: callId,
      duration: duration,
      endTime: Timestamp.fromDate(endTime),
      messageCount: messages.length,
      messages: messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date 
          ? Timestamp.fromDate(msg.timestamp) 
          : msg.timestamp
      })),
      startTime: Timestamp.fromDate(startTime),
      timestamp: Timestamp.now(),
      userId: userId,
    };
    
    const docRef = await addDoc(collection(db, 'call_logs'), callLogData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving call log:', error);
    throw error;
  }
};

/**
 * Get user's call logs (real-time listener)
 * Uses userId field (tara-calling format)
 */
export const subscribeToUserCallLogs = (
  userId: string,
  callback: (callLogs: CallLog[]) => void,
  limitCount: number = 20
): Unsubscribe => {
  const q = query(
    collection(db, 'call_logs'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  
  return onSnapshot(q, (snapshot) => {
    const callLogs: CallLog[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CallLog[];
    
    callback(callLogs);
  }, (error) => {
    console.error('Error subscribing to call logs:', error);
    callback([]);
  });
};

/**
 * Get user's call logs (one-time)
 * Supports both formats: Flutter (uid) and tara-calling (userId)
 * Priority: uid (Flutter format) since that's what we're saving now
 */
export const getUserCallLogs = async (
  userId: string,
  limitCount: number = 20
): Promise<CallLog[]> => {
  try {
    console.log(`[CallLogs] Fetching call logs for user: ${userId}`);
    
    // Try Flutter format first (uid field) - this is what we're saving now
    try {
      const q = query(
        collection(db, 'call_logs'),
        where('uid', '==', userId),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`[CallLogs] Found ${snapshot.docs.length} call logs with uid field`);
        const callLogs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            callId: data.callId || '',
            duration: data.call_duration_seconds || data.duration || 0, // Flutter uses call_duration_seconds
            endTime: data.created_at,
            messageCount: 0,
            messages: [],
            startTime: data.created_at,
            timestamp: data.created_at || data.timestamp,
            userId: data.uid || data.userId || userId,
          } as CallLog;
        });
        return callLogs;
      } else {
        console.log('[CallLogs] No call logs found with uid field, trying userId field...');
      }
    } catch (error: any) {
      // If orderBy fails (no index), try without orderBy and sort in memory
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.warn('[CallLogs] Index not found for uid query, fetching without orderBy and sorting in memory');
        try {
          const q = query(
            collection(db, 'call_logs'),
            where('uid', '==', userId),
            limit(limitCount * 2) // Get more to account for no ordering
          );
          
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            console.log(`[CallLogs] Found ${snapshot.docs.length} call logs with uid field (no orderBy)`);
            const callLogs = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                callId: data.callId || '',
                duration: data.call_duration_seconds || data.duration || 0,
                endTime: data.created_at,
                messageCount: 0,
                messages: [],
                startTime: data.created_at,
                timestamp: data.created_at || data.timestamp,
                userId: data.uid || data.userId || userId,
              } as CallLog;
            });
            
            // Sort by timestamp in memory (newest first)
            callLogs.sort((a, b) => {
              const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : (a.timestamp ? new Date(a.timestamp).getTime() : 0);
              const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : (b.timestamp ? new Date(b.timestamp).getTime() : 0);
              return bTime - aTime;
            });
            
            return callLogs.slice(0, limitCount);
          }
        } catch (fallbackError) {
          console.error('[CallLogs] Fallback query for uid also failed:', fallbackError);
        }
      } else {
        console.warn('[CallLogs] Error querying uid field:', error);
      }
    }
    
    // Fallback: Try tara-calling format (userId field) for backward compatibility
    try {
      const q = query(
        collection(db, 'call_logs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        console.log(`[CallLogs] Found ${snapshot.docs.length} call logs with userId field (legacy format)`);
        return snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            callId: data.callId || '',
            duration: data.duration || data.call_duration_seconds || 0, // Support both formats
            endTime: data.endTime || data.created_at,
            messageCount: data.messageCount || 0,
            messages: data.messages || [],
            startTime: data.startTime || data.created_at,
            timestamp: data.timestamp || data.created_at,
            userId: data.userId || data.uid || userId,
          } as CallLog;
        });
      }
    } catch (error) {
      console.warn('[CallLogs] Error querying userId field (legacy):', error);
    }
    
    console.log('[CallLogs] No call logs found for user');
    return [];
  } catch (error: any) {
    console.error('[CallLogs] Error getting user call logs:', error);
    return [];
  }
};

/**
 * Update existing call log or create new one if it doesn't exist
 * This is used for periodic saves during active calls
 * Uses Flutter format: uid, call_duration_seconds, created_at (matches existing database schema)
 */
export const updateCallLog = async (
  callLogId: string | null,
  callDurationSeconds: number,
  userId: string,
  email: string
): Promise<{ success: boolean; callLogId?: string; error?: string }> => {
  try {
    if (callLogId) {
      // Update existing call log
      try {
        const callLogRef = doc(db, 'call_logs', callLogId);
        await updateDoc(callLogRef, {
          call_duration_seconds: callDurationSeconds,
          // Keep existing created_at, uid, email unchanged
        });
        
        console.log(`✅ Call log updated: ${callLogId}, duration: ${callDurationSeconds}s`);
        return { success: true, callLogId };
      } catch (error: any) {
        // If document not found, try creating new one
        if (error.code === 'not-found') {
          console.log(`[CallLogs] Document ${callLogId} not found, creating new one...`);
          return updateCallLog(null, callDurationSeconds, userId, email);
        }
        throw error;
      }
    } else {
      // Create new call log (Flutter format to match existing database)
      const callLogData = {
        uid: userId,
        email: email,
        call_duration_seconds: callDurationSeconds,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'call_logs'), callLogData);
      console.log(`✅ New call log created: ${docRef.id}, duration: ${callDurationSeconds}s, uid: ${userId}`);

      return { success: true, callLogId: docRef.id };
    }
    
  } catch (error: any) {
    // Log all errors for debugging, but don't throw - call logs are optional
    if (error.code === 'permission-denied') {
      console.warn('⚠️ Call log permission denied - check Firestore rules for call_logs collection');
    } else {
      console.error('❌ Call log update failed:', error.code || error.message, error);
    }
    
    // Return failure but don't throw - call logs are optional
    return { success: false, error: error.code || 'Unknown error' };
  }
};

