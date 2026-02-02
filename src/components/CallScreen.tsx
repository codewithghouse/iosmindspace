import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAppState } from '../contexts/AppStateContext';
import { useConversation } from '@11labs/react';
import { useUserUsage } from '../hooks/useUserUsage';
import { updateCallLog } from '../services/callLogService';
import SubscriptionModal from './shared/SubscriptionModal';
import DisclaimerModal from './shared/DisclaimerModal';
import { SubscriptionPlan } from '../services/subscriptionService';

interface CallScreenProps {
  isVisible: boolean;
  onEndCall: () => void;
}

export default function CallScreen({ isVisible, onEndCall }: CallScreenProps) {
  const { theme } = useTheme();
  const { user, refreshUserProfile } = useAppState();
  const [isConnected, setIsConnected] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [conversationTime, setConversationTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentCallLogId, setCurrentCallLogId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState(() => {
    return localStorage.getItem('hasSeenTaraDisclaimer') === 'true';
  });
  const [isUpgradeModal, setIsUpgradeModal] = useState(false);
  const autoStartInitiatedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Usage tracking
  const { 
    usage, 
    isLoading: isUsageLoading, 
    updateUserUsage, 
    canStartCall, 
    formatRemainingTime,
    refreshUserUsage 
  } = useUserUsage(user?.uid || null);

  // ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('✅ Connected to ElevenLabs');
      setIsConnected(true);
      setIsTimerRunning(true);
      setConversationTime(0);
      setCurrentCallLogId(null);
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from ElevenLabs');
      setIsConnected(false);
      setIsTimerRunning(false);
      
      // Save final call log and refresh profile
      if (user?.uid && user?.email && conversationTime > 0) {
        updateCallLog(currentCallLogId, conversationTime, user.uid, user.email)
          .then((result) => {
            if (result.success) {
              console.log('✅ Final call log saved successfully');
            }
            // Refresh user profile to get updated total_conversation_seconds
            refreshUserProfile();
          })
          .catch((error) => {
            console.warn('⚠️ Call log save failed (non-critical):', error);
            // Still refresh profile even if call log fails
            refreshUserProfile();
          });
      } else {
        // Refresh profile even if no call log
        refreshUserProfile();
      }
      
      // Navigate back
      onEndCall();
    },
    onError: (error) => {
      console.error('❌ Conversation error:', error);
      setIsTimerRunning(false);
      
      // Save call log even on error and refresh profile
      if (user?.uid && user?.email && conversationTime > 0) {
        updateCallLog(currentCallLogId, conversationTime, user.uid, user.email)
          .then(() => {
            refreshUserProfile();
          })
          .catch(() => {
            // Still refresh profile even if call log fails
            refreshUserProfile();
          });
      } else {
        refreshUserProfile();
      }
      
      onEndCall();
    }
  });

  // Generate random star positions
  const stars = useMemo(() => {
    if (theme !== 'dark') return [];
    const starArray = [];
    const starCount = 20;
    for (let i = 0; i < starCount; i++) {
      const size = Math.random() < 0.33 ? 'small' : Math.random() < 0.66 ? 'medium' : 'large';
      starArray.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: size,
        delay: Math.random() * 2
      });
    }
    return starArray;
  }, [theme]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Timer effect - updates every second and saves usage every 10 seconds
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setConversationTime(prev => {
          const newTime = prev + 1;
          
          // Update usage every 10 seconds
          if (newTime % 10 === 0) {
            updateUserUsage(10);
            
            // Update call log every 10 seconds (non-blocking, errors handled silently)
            if (user?.uid && user?.email) {
              updateCallLog(currentCallLogId, newTime, user.uid, user.email).then((result) => {
                if (result.success && result.callLogId) {
                  setCurrentCallLogId(result.callLogId);
                }
                // Errors are handled silently in updateCallLog - call logs are optional
              }).catch(() => {
                // Silently ignore call log errors
              });
            }
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning, updateUserUsage, user?.uid, user?.email, currentCallLogId]);

  // Handle browser close - save call log (non-blocking)
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isConnected && conversationTime > 0 && user?.uid && user?.email) {
        // Use sendBeacon for reliability on page unload
        updateCallLog(currentCallLogId, conversationTime, user.uid, user.email).catch(() => {
          // Silently ignore errors on page unload
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isConnected, conversationTime, user?.uid, user?.email, currentCallLogId]);

  // Check remaining time and auto-end call if needed
  useEffect(() => {
    if (isConnected && usage && usage.remaining_seconds <= 0) {
      console.log('⏰ Time limit reached! Auto-ending call...');
      endCall();
    }
  }, [usage?.remaining_seconds, isConnected]);

  // Check remaining time every second during active calls
  useEffect(() => {
    if (!isConnected || !usage) return;

    const checkInterval = setInterval(() => {
      if (usage.remaining_seconds <= 0) {
        endCall();
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [isConnected, usage?.remaining_seconds]);

  // Show disclaimer on first visit
  useEffect(() => {
    if (isVisible && !hasSeenDisclaimer) {
      setShowDisclaimerModal(true);
    }
  }, [isVisible, hasSeenDisclaimer]);

  // Auto-start call when screen becomes visible (after all checks pass)
  useEffect(() => {
    if (!isVisible || !user || isConnected || autoStartInitiatedRef.current) return;
    
    // Wait for usage to load
    if (isUsageLoading) return;
    
    // If user has seen disclaimer and can start call, auto-start
    if (hasSeenDisclaimer && canStartCall() && !isConnected) {
      autoStartInitiatedRef.current = true;
      startVoiceCall();
    }
  }, [isVisible, user, hasSeenDisclaimer, canStartCall, isUsageLoading, isConnected]);

  // Reset auto-start flag when screen becomes invisible
  useEffect(() => {
    if (!isVisible) {
      autoStartInitiatedRef.current = false;
    }
  }, [isVisible]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
    }
  };

  // Start call
  const startCall = async () => {
    if (!user) return;

    // Check if user has seen disclaimer
    if (!hasSeenDisclaimer) {
      setShowDisclaimerModal(true);
      return;
    }

    // Check if user can start call
    if (hasSeenDisclaimer && canStartCall()) {
      await startVoiceCall();
      return;
    }

    // Show subscription modal
    setIsUpgradeModal(false);
    setShowSubscriptionModal(true);
  };

  // Start voice call with ElevenLabs
  const startVoiceCall = async () => {
    try {
      // Request microphone permission if not already granted
      if (!permissionGranted && navigator?.mediaDevices?.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissionGranted(true);
        } catch (err) {
          setPermissionGranted(false);
          console.log('Proceeding without microphone access');
        }
      }

      const agentId = import.meta.env.VITE_AGENT_ID;
      if (!agentId) {
        throw new Error('Agent ID not configured');
      }

      await conversation.startSession({
        agentId: agentId,
      });
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      onEndCall();
    }
  };

  // End call
  const endCall = async () => {
    try {
      setIsTimerRunning(false);
      
      // Save final call log and refresh profile
      if (user?.uid && user?.email && conversationTime > 0) {
        updateCallLog(currentCallLogId, conversationTime, user.uid, user.email)
          .then((result) => {
            if (result.success) {
              console.log('✅ Final call log saved on manual end');
            }
            // Refresh user profile to get updated total_conversation_seconds
            refreshUserProfile();
          })
          .catch((error) => {
            console.warn('⚠️ Call log save failed on manual end (non-critical):', error);
            // Still refresh profile even if call log fails
            refreshUserProfile();
          });
      } else {
        // Refresh profile even if no call log
        refreshUserProfile();
      }
      
      await conversation.endSession();
    } catch (error) {
      console.error('Failed to end conversation:', error);
      // Refresh profile even on error
      refreshUserProfile();
    }
  };

  // Handle plan selection from subscription modal
  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    if (plan.id === 'free') {
      setShowSubscriptionModal(false);
      await startVoiceCall();
      return;
    }

    // For paid plans, subscription is handled in the modal
    // Just refresh usage and start call
    await refreshUserUsage();
    setShowSubscriptionModal(false);
    await startVoiceCall();
  };

  // Handle disclaimer acceptance
  const handleDisclaimerAccept = () => {
    setHasSeenDisclaimer(true);
    localStorage.setItem('hasSeenTaraDisclaimer', 'true');
    setShowDisclaimerModal(false);
    
    // Auto-start call if user can
    if (canStartCall()) {
      startVoiceCall();
    } else {
      setShowSubscriptionModal(true);
    }
  };

  // Reset when screen becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setConversationTime(0);
      setIsConnected(false);
      setIsTimerRunning(false);
      setCurrentCallLogId(null);
      setPermissionGranted(false);
    }
  }, [isVisible]);

  // Handle mute (integrate with ElevenLabs if available)
  const handleMute = () => {
    // TODO: Integrate with ElevenLabs mute functionality
    console.log('Mute toggle (not yet integrated with ElevenLabs)');
  };

  // Handle speaker (audio output control)
  const handleSpeaker = () => {
    // TODO: Integrate with audio output device selection
    console.log('Speaker toggle (not yet integrated)');
  };

  if (!isVisible) return null;

  const isListening = isConnected;
  const isConnecting = false; // We don't have a connecting state from ElevenLabs

    return (
      <>
        {/* Header with Back and Upgrade Plan */}
        <div 
          className="fixed top-0 left-0 right-0 backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top z-50" 
          style={{ 
            backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.95)', 
            borderColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(162, 173, 156, 0.4)'
          }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onEndCall}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors touch-target"
              aria-label="Back"
              style={{ color: theme === 'dark' ? '#E5E5E5' : '#1A1A1A' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              onClick={() => {
                setIsUpgradeModal(true);
                setShowSubscriptionModal(true);
              }}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all touch-target active:scale-95"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.9)' : 'rgba(162, 173, 156, 0.9)',
                color: '#FFFFFF',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
              }}
            >
              Upgrade Plan
            </button>
          </div>
        </div>

        {/* Sun/Moon */}
        {theme === 'dark' ? (
        <div className="moon-container">
          <div className="moon-glow"></div>
          <div className="moon"></div>
        </div>
      ) : (
        <div className="sun-container">
          <div className="sun-glow"></div>
          <div className="sun"></div>
        </div>
      )}
      
      {/* Stars */}
      {theme === 'dark' && (
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className={`star star-${star.size}`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: `${star.delay}s`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Clouds */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
      <div 
        className="absolute inset-0 h-screen w-full flex flex-col safe-top safe-bottom relative overflow-hidden theme-transition" 
        style={{ 
          background: theme === 'dark' 
            ? 'linear-gradient(to bottom, #1a1a1a, #2a2a2a, #1a1a1a)' 
            : 'linear-gradient(to bottom, #F7F5F2, #E8E6E1, #F7F5F2)'
        }}
      >
        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center px-4 relative z-10" style={{ paddingTop: '140px' }}>
          
          {/* Large Glowing Sphere */}
          <div className="relative mb-4 flex items-center justify-center">
            {/* Outer Glow Layers */}
            <div 
              className="absolute w-80 h-80 rounded-full"
              style={{
                background: theme === 'dark'
                  ? 'radial-gradient(circle, rgba(162, 173, 156, 0.4) 0%, rgba(162, 173, 156, 0.2) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(162, 173, 156, 0.3) 0%, rgba(162, 173, 156, 0.15) 40%, transparent 70%)',
                animation: 'pulseGlow 3s ease-in-out infinite',
                filter: 'blur(40px)'
              }}
            />
            <div 
              className="absolute w-72 h-72 rounded-full"
              style={{
                background: theme === 'dark'
                  ? 'radial-gradient(circle, rgba(162, 173, 156, 0.3) 0%, rgba(162, 173, 156, 0.15) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(162, 173, 156, 0.2) 0%, rgba(162, 173, 156, 0.1) 50%, transparent 70%)',
                animation: 'pulseGlow 2.5s ease-in-out infinite 0.3s',
                filter: 'blur(30px)'
              }}
            />
            
            {/* Main Glowing Sphere */}
            <div 
              className="relative rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: '200px',
                height: '200px',
                background: theme === 'dark'
                  ? (isListening 
                      ? 'radial-gradient(circle at 30% 30%, rgba(162, 173, 156, 0.9) 0%, rgba(162, 173, 156, 0.7) 30%, rgba(162, 173, 156, 0.5) 60%, rgba(162, 173, 156, 0.2) 100%)'
                      : 'radial-gradient(circle at 30% 30%, rgba(162, 173, 156, 0.7) 0%, rgba(162, 173, 156, 0.5) 30%, rgba(162, 173, 156, 0.3) 60%, rgba(162, 173, 156, 0.1) 100%)')
                  : (isListening
                      ? 'radial-gradient(circle at 30% 30%, rgba(162, 173, 156, 0.8) 0%, rgba(162, 173, 156, 0.6) 30%, rgba(162, 173, 156, 0.4) 60%, rgba(162, 173, 156, 0.15) 100%)'
                      : 'radial-gradient(circle at 30% 30%, rgba(162, 173, 156, 0.6) 0%, rgba(162, 173, 156, 0.4) 30%, rgba(162, 173, 156, 0.25) 60%, rgba(162, 173, 156, 0.1) 100%)'),
                boxShadow: theme === 'dark'
                  ? (isListening 
                      ? '0 0 80px rgba(162, 173, 156, 0.6), 0 0 120px rgba(162, 173, 156, 0.4), 0 0 160px rgba(162, 173, 156, 0.2), inset 0 0 60px rgba(255, 255, 255, 0.1)'
                      : '0 0 60px rgba(162, 173, 156, 0.4), 0 0 100px rgba(162, 173, 156, 0.2), inset 0 0 40px rgba(255, 255, 255, 0.05)')
                  : (isListening
                      ? '0 0 80px rgba(162, 173, 156, 0.4), 0 0 120px rgba(162, 173, 156, 0.25), 0 0 160px rgba(162, 173, 156, 0.15), inset 0 0 60px rgba(255, 255, 255, 0.2)'
                      : '0 0 60px rgba(162, 173, 156, 0.3), 0 0 100px rgba(162, 173, 156, 0.15), inset 0 0 40px rgba(255, 255, 255, 0.1)'),
                animation: isListening ? 'spherePulse 2s ease-in-out infinite' : 'none'
              }}
            >
              {/* Subtle Logo Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div 
                  className="text-4xl font-light theme-transition" 
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    color: theme === 'dark' ? '#E5E5E5' : '#3A3A3A'
                  }}
                >
                  TARA
                </div>
              </div>
            </div>
          </div>

          {/* Status Text Below Sphere */}
          <div className="text-center mb-4">
            <div 
              className="text-sm font-light theme-transition" 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: theme === 'dark' ? 'rgba(229, 229, 229, 0.6)' : 'rgba(58, 58, 58, 0.6)'
              }}
            >
              {isConnected ? 'Call Active' : !permissionGranted ? 'Preparing...' : 'Ready to Call'}
            </div>
          </div>

          {/* Talking Time Display - Below Sphere */}
          <div className="text-center mb-6">
            <div 
              className="text-2xl font-semibold theme-transition" 
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: theme === 'dark' ? '#7A8A7A' : '#7A8A7A'
              }}
            >
              {formatTime(conversationTime)}
            </div>
          </div>

          {/* Call Control Buttons */}
          {isConnected && (
            <div className="w-full max-w-md px-4 mb-4">
              <div className="flex justify-center gap-6">
                {/* Mute Button */}
                <button
                  onClick={handleMute}
                  className="flex flex-col items-center gap-2 touch-target active:opacity-70 transition-opacity"
                  aria-label="Mute"
                >
                  <div 
                    className="w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg theme-transition" 
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill={theme === 'dark' ? 'white' : '#3A3A3A'}/>
                    </svg>
                  </div>
                  <span 
                    className="text-xs font-light theme-transition" 
                    style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                      color: theme === 'dark' ? '#E5E5E5' : '#3A3A3A'
                    }}
                  >
                    Mute
                  </span>
                </button>

                {/* Speaker Button */}
                <button
                  onClick={handleSpeaker}
                  className="flex flex-col items-center gap-2 touch-target active:opacity-70 transition-opacity"
                  aria-label="Speaker"
                >
                  <div 
                    className="w-14 h-14 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg theme-transition" 
                    style={{
                      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
                      borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill={theme === 'dark' ? "white" : "#3A3A3A"}/>
                    </svg>
                  </div>
                  <span 
                    className="text-xs font-light theme-transition" 
                    style={{ 
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                      color: theme === 'dark' ? '#E5E5E5' : '#3A3A3A'
                    }}
                  >
                    Speaker
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Call Duration Display */}
          {isConnected && (
            <div className="mt-2">
              <div 
                className="text-base font-light theme-transition" 
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  color: theme === 'dark' ? '#E5E5E5' : '#3A3A3A'
                }}
              >
                {formatTime(conversationTime)}
              </div>
            </div>
          )}

          {/* Call/End Call Button - Fixed position without nav bar */}
          <div 
            className="fixed left-0 right-0 w-full px-4"
            style={{
              bottom: 'max(80px, env(safe-area-inset-bottom) + 80px)'
            }}
          >
            <div className="w-full max-w-md mx-auto">
              <button
                onClick={isConnected ? endCall : startCall}
                disabled={isUsageLoading || (!usage && !isConnected)}
                className={`w-full py-4 px-8 rounded-full font-medium transition-all touch-target flex items-center justify-center gap-3 shadow-2xl active:scale-95 relative overflow-hidden ${
                  isConnected 
                    ? 'bg-red-600 active:bg-red-700 text-white' 
                    : (!usage || isUsageLoading)
                      ? 'bg-gray-500 cursor-wait text-white'
                      : canStartCall()
                      ? 'bg-green-500 active:bg-green-600 text-white'
                      : 'bg-blue-500 active:bg-blue-600 text-white cursor-pointer'
                }`}
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  fontSize: '18px',
                  minHeight: '56px',
                  boxShadow: isConnected 
                    ? '0 0 30px rgba(220, 38, 38, 0.5), 0 0 60px rgba(220, 38, 38, 0.3)'
                    : '0 0 20px rgba(0, 0, 0, 0.2)'
                }}
                aria-label={isConnected ? "End call" : "Start call"}
              >
                {isConnected ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                      <path
                        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                        fill="white"
                      />
                    </svg>
                    <span className="relative z-10">End Call</span>
                  </>
                ) : (
                  <>
                    {(!usage || isUsageLoading) ? 'Loading...' : canStartCall() ? 'Call' : 'Subscribe'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPlan={handlePlanSelection}
        userRemainingTime={usage?.remaining_seconds || 0}
        showFreeTrial={!isUpgradeModal}
        isReturningUser={hasSeenDisclaimer}
      />

      {/* Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onAccept={handleDisclaimerAccept}
      />
    </>
  );
}
