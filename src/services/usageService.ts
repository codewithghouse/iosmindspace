import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface UserUsage {
  total_conversation_seconds: number;
  remaining_seconds: number;
  remaining_minutes: number;
  remaining_hours: number;
}

const FREE_LIMIT_SECONDS = 20 * 60; // 20 minutes in seconds

/**
 * Load user usage from Firebase user collection
 */
export const loadUserUsage = async (uid: string): Promise<UserUsage | null> => {
  if (!uid) return null;

  try {
    const userDoc = doc(db, 'user', uid);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const totalSeconds = userData.total_conversation_seconds || 0;
      const remainingSeconds = userData.remaining !== undefined ? userData.remaining : FREE_LIMIT_SECONDS;
      const remainingMinutes = Math.floor(remainingSeconds / 60);
      const remainingHours = Math.floor(remainingSeconds / 3600);

      console.log(`📊 Database data: total_conversation_seconds = ${userData.total_conversation_seconds}, remaining = ${userData.remaining}`);
      console.log(`📊 Loaded usage: ${totalSeconds} seconds used, ${remainingSeconds} seconds remaining (${remainingMinutes} minutes, ${remainingHours} hours)`);

      return {
        total_conversation_seconds: totalSeconds,
        remaining_seconds: remainingSeconds,
        remaining_minutes: remainingMinutes,
        remaining_hours: remainingHours
      };
    } else {
      // Initialize new user with full remaining time
      console.log('User document not found, initializing with full remaining time');
      return {
        total_conversation_seconds: 0,
        remaining_seconds: FREE_LIMIT_SECONDS,
        remaining_minutes: 20,
        remaining_hours: 0
      };
    }
  } catch (error) {
    console.error('Error loading user usage:', error);
    return null;
  }
};

/**
 * Update user usage after call ends or during call
 */
export const updateUserUsage = async (
  uid: string,
  callDurationSeconds: number
): Promise<boolean> => {
  if (!uid) return false;

  console.log(`Starting updateUserUsage with duration: ${callDurationSeconds} seconds`);

  try {
    const userDoc = doc(db, 'user', uid);

    // First try to get the existing document
    const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
      // Document exists, update both total_conversation_seconds and remaining
      const userData = userSnapshot.data();
      const currentUsage = userData.total_conversation_seconds || 0;
      const currentRemaining = userData.remaining !== undefined ? userData.remaining : FREE_LIMIT_SECONDS;
      const newUsage = currentUsage + callDurationSeconds;
      const newRemaining = Math.max(0, currentRemaining - callDurationSeconds);

      console.log(`Current usage: ${currentUsage}, Current remaining: ${currentRemaining}`);
      console.log(`New usage: ${newUsage}, New remaining: ${newRemaining}`);

      await updateDoc(userDoc, {
        total_conversation_seconds: newUsage,
        remaining: newRemaining,
        updated_at: serverTimestamp()
      });

      console.log(`✅ Successfully updated database with new usage: ${newUsage} seconds`);
      console.log(`Updated usage: ${currentUsage} + ${callDurationSeconds} = ${newUsage} seconds`);
      console.log(`Updated remaining: ${currentRemaining} - ${callDurationSeconds} = ${newRemaining} seconds`);
      return true;
    } else {
      // Document doesn't exist, create it with initial values
      const newRemaining = Math.max(0, FREE_LIMIT_SECONDS - callDurationSeconds);
      await setDoc(userDoc, {
        total_conversation_seconds: callDurationSeconds,
        remaining: newRemaining,
        updated_at: serverTimestamp()
      });

      console.log(`✅ Successfully created new user document with usage: ${callDurationSeconds} seconds, remaining: ${newRemaining} seconds`);
      return true;
    }
  } catch (error) {
    console.error('❌ Error updating user usage:', error);
    return false;
  }
};

/**
 * Check if user can start a call
 */
export const canStartCall = (usage: UserUsage | null): boolean => {
  if (!usage) {
    console.log('❌ No usage data available');
    return false;
  }
  console.log(`🔍 Checking canStartCall: remaining_seconds = ${usage.remaining_seconds}`);
  const canStart = usage.remaining_seconds > 0;
  console.log(`✅ Can start call: ${canStart}`);
  return canStart;
};

/**
 * Format remaining time as MM:SS
 */
export const formatRemainingTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format remaining time as HH:MM:SS
 */
export const formatRemainingTimeDetailed = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

