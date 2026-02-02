import { 
  collection, 
  addDoc,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getUserReference } from '../utils/firestoreAdapter';
import { TaraSubscription } from '../types';

/**
 * Get user's subscription (real-time listener)
 */
export const subscribeToUserSubscription = (
  uid: string,
  callback: (subscription: TaraSubscription | null) => void
): Unsubscribe => {
  const userRef = getUserReference(uid);
  
  const q = query(
    collection(db, 'tara_subscription'),
    where('user_ref', '==', userRef),
    orderBy('dateandtime', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    
    const subscription = {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as TaraSubscription;
    
    callback(subscription);
  }, (error) => {
    console.error('Error subscribing to subscription:', error);
    callback(null);
  });
};

/**
 * Get user's subscription (one-time)
 */
export const getUserSubscription = async (
  uid: string
): Promise<TaraSubscription | null> => {
  try {
    const userRef = getUserReference(uid);
    
    const q = query(
      collection(db, 'tara_subscription'),
      where('user_ref', '==', userRef),
      orderBy('dateandtime', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    } as TaraSubscription;
  } catch (error: any) {
    console.error('Error getting user subscription:', error);
    throw error;
  }
};

export interface SubscriptionPlan {
  id: string;
  calls: number;
  minutes: number;
  price: number;
  description: string;
}

/**
 * Update user subscription and remaining time
 * Updates user.remaining and user.plan based on selected plan
 */
export const updateSubscription = async (
  uid: string,
  email: string,
  plan: SubscriptionPlan
): Promise<{ success: boolean; error?: string }> => {
  if (!uid) {
    return { success: false, error: 'User not authenticated' };
  }
  
  try {
    // Determine plan name and remaining minutes based on price
    let planName = '';
    let remainingSeconds = 0;
    
    switch (plan.price) {
      case 0: // Free plan
        planName = 'Free Trial';
        remainingSeconds = 20 * 60; // 20 minutes in seconds
        break;
      case 249:
        planName = 'Basic';
        remainingSeconds = 40 * 60; // 40 minutes in seconds
        break;
      case 1150:
        planName = 'Pro';
        remainingSeconds = 200 * 60; // 200 minutes in seconds
        break;
      case 2250:
        planName = 'Premium';
        remainingSeconds = 400 * 60; // 400 minutes in seconds
        break;
      default:
        return { success: false, error: 'Invalid plan selected' };
    }
    
    // Get current user data to check existing remaining time
    const userDoc = doc(db, 'user', uid);
    const userSnapshot = await getDoc(userDoc);
    
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const currentRemaining = userData.remaining || 0;
      const currentPlan = userData.plan || 'Free Trial';
      const currentConversationSeconds = userData.total_conversation_seconds || 0;
      
      // Plan hierarchy for keeping highest plan
      const planHierarchy = {
        'Free Trial': 0,
        'Basic': 1,
        'Pro': 2,
        'Premium': 3
      };
      
      const currentLevel = planHierarchy[currentPlan as keyof typeof planHierarchy] || 0;
      const newLevel = planHierarchy[planName as keyof typeof planHierarchy] || 0;
      
      // Keep the higher plan
      const finalPlan = newLevel > currentLevel ? planName : currentPlan;
      
      if (currentRemaining > 0) {
        // User has existing time - ADD to it (new behavior)
        const newRemaining = currentRemaining + remainingSeconds;
        
        await updateDoc(userDoc, {
          plan: finalPlan,
          remaining: newRemaining,
          updated_at: serverTimestamp(),
          // Keep existing conversation history
        });
        
        console.log('✅ Subscription updated successfully (ADDED to existing time):', { 
          finalPlan, 
          previousRemaining: currentRemaining, 
          addedTime: remainingSeconds, 
          newTotal: newRemaining 
        });
      } else {
        // User has 0 time - OVERWRITE (current behavior)
        await updateDoc(userDoc, {
          plan: finalPlan,
          remaining: remainingSeconds,
          total_conversation_seconds: 0, // Reset conversation seconds on plan change
          updated_at: serverTimestamp(),
        });
        
        console.log('✅ Subscription updated successfully (OVERWRITTEN - user had 0 time):', { 
          finalPlan, 
          remainingSeconds 
        });
      }
    } else {
      // User document doesn't exist - create new
      await setDoc(userDoc, {
        plan: planName,
        remaining: remainingSeconds,
        total_conversation_seconds: 0,
        updated_at: serverTimestamp(),
      });
      
      console.log('✅ New user subscription created:', { planName, remainingSeconds });
    }
    
    // Create or update tara_subscription document
    if (plan.price > 0) { // Only for paid plans
      try {
        const userRef = getUserReference(uid);
        const subscriptionData = {
          name: email.split('@')[0] || 'User',
          email: email,
          user_ref: userRef,
          dateandtime: Timestamp.now(),
          price: plan.price,
          conversation_count_at_purchase: 0,
          plan: planName,
          payment_id: `payment_${Date.now()}`,
        };
        
        await addDoc(collection(db, 'tara_subscription'), subscriptionData);
        console.log('✅ Subscription document created in tara_subscription collection');
      } catch (error) {
        console.warn('⚠️ Failed to create subscription document (non-critical):', error);
        // Don't fail the whole operation if subscription document creation fails
      }
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Update subscription failed:', error);
    let errorMessage = 'Failed to update subscription. Please try again.';
    
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Permission denied. Please contact support.';
          break;
        case 'unavailable':
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Error: ${error.code}`;
      }
    }
    
    return { success: false, error: errorMessage };
  }
};

