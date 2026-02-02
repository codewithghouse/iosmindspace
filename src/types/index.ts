// Screen Types
export type ScreenType = 
  | 'presence' 
  | 'onboarding' 
  | 'email' 
  | 'signin' 
  | 'forgotPassword' 
  | 'chat' 
  | 'home' 
  | 'call' 
  | 'assessments' 
  | 'booking' 
  | 'profile' 
  | 'journal' 
  | 'selfcare' 
  | 'toolsSounds' 
  | 'articles' 
  | 'assessmentDetail' 
  | 'breathing' 
  | 'insights';

// User Profile (matches Flutter app schema)
export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  photo_url?: string;
  created_time: any; // Firestore Timestamp
  phone_number?: string;
  gender?: string;
  location?: string;
  remaining?: number; // Conversation seconds remaining
  total_conversation_seconds?: number;
  plan?: string; // e.g., "Free Trial"
  is_admin?: boolean;
  // React app additions
  theme?: 'light' | 'dark';
  language?: string;
  updated_at?: any; // Firestore Timestamp
  // Aliases for React app compatibility
  displayName?: string;
  photoUrl?: string;
  createdAt?: any;
  updatedAt?: any;
  phoneNumber?: string;
  isAdmin?: boolean;
}

// Mood Tracker
export interface MoodTracker {
  id?: string;
  emoji: string;
  mood: string;
  date_time: any; // Firestore Timestamp
  uid: any; // DocumentReference to /user/{uid}
  user_email: string;
}

// Journal Entry
export interface JournalEntry {
  id?: string;
  user_email: string;
  uid: any; // DocumentReference to /user/{uid}
  journal_entry: string;
  date_time: any; // Firestore Timestamp
  description: string;
}

// Assessment Result (supports both Flutter and existing data formats)
export interface AssessmentResult {
  id?: string;
  // Flutter format (primary)
  uid?: any; // DocumentReference
  user_email?: string;
  // Alternative format (for existing data)
  email?: string;
  assessment_name: string;
  score: string;
  submit_time: any; // Firestore Timestamp
  // Optional additional fields
  call_duration_seconds?: number;
  created_at?: any; // Firestore Timestamp
  chatbotlink?: string;
  dateandtime?: any; // Firestore Timestamp
}

// Call Log (tara-calling app format)
export interface CallLog {
  id?: string;
  callId: string;
  duration: number;
  endTime: any; // Firestore Timestamp
  messageCount: number;
  messages: CallMessage[];
  startTime: any; // Firestore Timestamp
  timestamp: any; // Firestore Timestamp
  userId: string;
}

export interface CallMessage {
  message: string;
  role: 'ai' | 'user';
  timestamp: any; // Firestore Timestamp
}

// Conversation (Voice Call Transcript)
export interface Conversation {
  id?: string;
  created_at: any; // Firestore Timestamp
  email: string;
  feedback?: string;
  uid: any; // DocumentReference to /user/{uid}
  body: string;
  created_by: string;
  num_sent: number;
  status: string;
  target: string;
  title: string;
}

// Feedback
export interface Feedback {
  id?: string;
  created_at: any; // Firestore Timestamp
  email: string;
  feedback: string;
  uid: any; // DocumentReference to /user/{uid}
}

// Push Notification
export interface PushNotification {
  id?: string;
  content: string;
  created_at: any; // Firestore Timestamp
  email: string;
  onesignal_id?: string;
  recipients: number;
  title: string;
}

// Tara Link
export interface TaraLink {
  id?: string;
  date_time: any; // Firestore Timestamp
  tara_link: string;
}

// Tara Subscription
export interface TaraSubscription {
  id?: string;
  name: string;
  email: string;
  user_ref: any; // DocumentReference to /user/{uid}
  dateandtime: any; // Firestore Timestamp
  price: number;
  conversation_count_at_purchase: number;
  plan: string;
  payment_id: string;
}

// Assessment Types (for UI)
export interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: number;
  estimatedTime: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Health Status Types
export type HealthStatusType = 'excellent' | 'good' | 'fair' | 'poor';

// Theme Types
export type Theme = 'light' | 'dark';

