import { useState, useEffect, useRef, useMemo } from 'react';
import ChatMessage from './ChatMessage';
import VoiceCallEntry from './VoiceCallEntry';
import { useTheme } from '../contexts/ThemeContext';
import { generateTARAStreamingResponse, type ChatMessage as TARAChatMessage } from '../services/taraChatService';

export interface Message {
  id: string;
  type: 'ai' | 'user' | 'voice';
  content?: string;
  time?: string;
  duration?: string;
  timestamp: Date;
}

interface ChatScreenProps {
  isVisible: boolean;
  onBack?: () => void;
  onCall?: () => void;
  onNewChat?: () => void;
  onOpenChat?: (chatId: string) => void;
}

export default function ChatScreen({ isVisible, onBack, onCall, onNewChat, onOpenChat }: ChatScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const { theme } = useTheme();
  
  // Generate unique initial messages with timestamp-based IDs
  const getInitialMessages = (): Message[] => {
    const baseTimestamp = Date.now();
    return [
      {
        id: `ai-initial-${baseTimestamp}-1`,
        type: 'ai' as const,
        content: "Hey there! I'm TARA, your AI emotional coach. It's great to have you here.",
        timestamp: new Date()
      },
      {
        id: `ai-initial-${baseTimestamp}-2`,
        type: 'ai' as const,
        content: 'Consider this your safe space, somewhere you can be completely yourself without any fear of judgment or worries.',
        timestamp: new Date()
      },
      {
        id: `ai-initial-${baseTimestamp}-3`,
        type: 'ai' as const,
        content: "So, how are you feeling today?",
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [hasStartedInitialStream, setHasStartedInitialStream] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<TARAChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageIdCounterRef = useRef(0);
  const streamingAbortControllerRef = useRef<AbortController | null>(null);

  // Generate random star positions (memoized for performance)
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

  useEffect(() => {
    if (isVisible && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isVisible]);

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  // Reset when screen becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setMessages([]);
      setHasStartedInitialStream(false);
      setStreamingMessageId(null);
      setInputValue('');
      setConversationHistory([]);
      messageIdCounterRef.current = 0;
      
      // Cancel any ongoing streaming
      if (streamingAbortControllerRef.current) {
        streamingAbortControllerRef.current.abort();
        streamingAbortControllerRef.current = null;
      }
    }
  }, [isVisible]);

  // Start streaming initial messages when screen becomes visible
  useEffect(() => {
    if (isVisible && !hasStartedInitialStream) {
      setHasStartedInitialStream(true);
      const initialMessages = getInitialMessages();
      // Start streaming first message
      let messageIndex = 0;
      const streamNextMessage = () => {
        if (messageIndex < initialMessages.length) {
          const message = initialMessages[messageIndex];
          // Prevent duplicate messages by checking if message already exists
          setMessages(prev => {
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
          setStreamingMessageId(message.id);
          
          // Clear streaming after message is fully displayed
          const messageLength = message.content?.length || 0;
          setTimeout(() => {
            setStreamingMessageId(null);
            messageIndex++;
            if (messageIndex < initialMessages.length) {
              // Small delay between messages
              setTimeout(streamNextMessage, 300);
            }
          }, messageLength * 20 + 200);
        }
      };
      
      // Start streaming after a brief delay
      setTimeout(streamNextMessage, 500);
    }
  }, [isVisible, hasStartedInitialStream]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessageText = inputValue.trim();
    messageIdCounterRef.current += 1;
    const userMessage: Message = {
      id: `user-${Date.now()}-${messageIdCounterRef.current}`,
      type: 'user',
      content: userMessageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Update conversation history
    setConversationHistory(prev => [
      ...prev,
      { role: 'user', content: userMessageText }
    ]);
    
    // Keep focus on input field after sending (like WhatsApp)
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    // Create AI message placeholder
    messageIdCounterRef.current += 1;
    const aiMessageId = `ai-${Date.now()}-${messageIdCounterRef.current}`;
    const aiMessage: Message = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setStreamingMessageId(aiMessageId);
    setIsTyping(false);

    try {
      // Get conversation history for context
      const history = conversationHistory;
      
      // Stream TARA's response
      let fullResponse = '';
      const stream = generateTARAStreamingResponse(userMessageText, history);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        // Update message content as it streams
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: fullResponse }
            : msg
        ));
        
        // Auto-scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
      }

      // Update conversation history with TARA's response
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: fullResponse }
      ]);

      // Clear streaming indicator
      setStreamingMessageId(null);

    } catch (error) {
      console.error('Error getting TARA response:', error);
      
      // Fallback response
      const fallbackResponse = "I'm here to listen. Could you tell me a bit more about what's on your mind?";
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: fallbackResponse }
          : msg
      ));
      
      setConversationHistory(prev => [
        ...prev,
        { role: 'assistant', content: fallbackResponse }
      ]);
      
      setStreamingMessageId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle image attachment
  const handleAttachImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          // Create a message with the image
          messageIdCounterRef.current += 1;
          const imageMessage: Message = {
            id: `image-${Date.now()}-${messageIdCounterRef.current}`,
            type: 'user',
            content: `[Image: ${file.name}]`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, imageMessage]);
          // Simulate AI response
          setTimeout(() => {
            messageIdCounterRef.current += 1;
            const aiMessage: Message = {
              id: `ai-${Date.now()}-${messageIdCounterRef.current}`,
              type: 'ai',
              content: "I can see you've shared an image. How does it relate to how you're feeling?",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
          }, 500);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleVoiceMessage = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true);
      // In a real app, you would use Web Audio API or MediaRecorder API here
      console.log('Starting voice recording...');
    } else {
      // Stop recording
      setIsRecording(false);
      // Simulate sending voice message
      messageIdCounterRef.current += 1;
      const voiceMessage: Message = {
        id: `voice-${Date.now()}-${messageIdCounterRef.current}`,
        type: 'voice',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        duration: '0:05',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, voiceMessage]);
      // Simulate AI response
      setTimeout(() => {
        messageIdCounterRef.current += 1;
        const aiMessage: Message = {
          id: `ai-${Date.now()}-${messageIdCounterRef.current}`,
          type: 'ai',
          content: "I heard your voice message. Thank you for sharing that with me.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);
    }
  };


  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.6)' : 'rgba(212, 209, 202, 0.5)';
  const bgTopBar = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.5)';
  const bgBanner = theme === 'dark' ? 'rgba(122, 138, 122, 0.15)' : 'rgba(162, 173, 156, 0.1)';
  const bgInput = theme === 'dark' ? 'rgba(60, 60, 60, 0.9)' : 'rgba(247, 245, 242, 0.8)';
  const bgTyping = theme === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.6)';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';
  const iconHover = theme === 'dark' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.4)';
  const buttonBg = theme === 'dark' ? 'rgba(60, 60, 60, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <>
      {/* Sun/Moon - Fixed position, outside scrollable container */}
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
      
      {/* Twinkling Stars - Only in dark theme */}
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
      
      {/* Multiple organic clouds - Fixed position, outside scrollable container */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
    <div className="absolute inset-0 h-screen w-full flex safe-top safe-bottom relative overflow-hidden theme-transition" style={{ backgroundColor: bgColor }}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
        <div className="relative">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back"
              className="touch-target p-2 rounded-full transition-colors focus:outline-none focus:ring-2 theme-transition"
              style={{ 
                activeBackgroundColor: iconHover,
                focusRingColor: accentColor
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = iconHover}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A2AD9C] to-[#98A392] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                fill="#F7F5F2"
              />
            </svg>
          </div>
          <div>
            <div className="font-medium theme-transition" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', fontSize: '16px', color: textPrimary }}>
              TARA
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full status-pulse theme-transition" style={{ backgroundColor: accentColor }} aria-hidden="true" />
              <span className="text-xs theme-transition" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textSecondary }}>
                Online
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (onCall) {
              onCall();
            }
          }}
          aria-label="Start voice call with TARA"
          className="touch-target p-2 rounded-full transition-colors focus:outline-none focus:ring-2 theme-transition"
          style={{ 
            activeBackgroundColor: iconHover,
            focusRingColor: accentColor
          }}
          onMouseDown={(e) => e.currentTarget.style.backgroundColor = iconHover}
          onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={accentColor}
            />
          </svg>
        </button>
      </div>

      {/* Privacy Banner */}
      <div className="backdrop-blur-sm px-4 py-3 flex items-center gap-2 border-b relative z-20 theme-transition" style={{ backgroundColor: bgBanner, borderColor: borderColor }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"
            fill={accentColor}
          />
        </svg>
        <p className="text-xs leading-relaxed theme-transition" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textSecondary }}>
          Your chats are end-to-end encrypted and private. Only you have access to these conversations.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10 scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
        {messages.map((message, index) => {
          // Use message.id as key since IDs are now guaranteed unique
          // Fallback to index if id is somehow missing
          const uniqueKey = message.id || `msg-${index}`;
          if (message.type === 'voice') {
            return (
              <div key={uniqueKey} className="message-enter" style={{ animationDelay: `${index * 50}ms` }}>
                <VoiceCallEntry
                  time={message.time || ''}
                  duration={message.duration || ''}
                  onViewTranscript={() => console.log('View transcript for', message.id)}
                />
              </div>
            );
          }
          return (
            <div key={uniqueKey} style={{ animationDelay: `${index * 50}ms` }}>
              <ChatMessage
                type={message.type}
                content={message.content || ''}
                isStreaming={message.id === streamingMessageId && message.type === 'ai'}
              />
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start mb-4 message-enter">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full mt-2 status-pulse theme-transition" style={{ backgroundColor: accentColor }} aria-hidden="true" />
              <div className="rounded-2xl rounded-tl-sm px-5 py-4 theme-transition" style={{ backgroundColor: bgTyping }}>
                <div className="flex gap-2 items-center">
                  <div className="w-2.5 h-2.5 rounded-full typing-dot theme-transition" style={{ backgroundColor: accentColor }} />
                  <div className="w-2.5 h-2.5 rounded-full typing-dot theme-transition" style={{ backgroundColor: accentColor }} />
                  <div className="w-2.5 h-2.5 rounded-full typing-dot theme-transition" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar - Flat Design */}
      <div className="px-4 py-4 safe-bottom relative z-20 backdrop-blur-sm theme-transition" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', backgroundColor: bgInput }}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={handleAttachImage}
            aria-label="Attach image"
            className="touch-target p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 theme-transition"
            style={{ 
              activeBackgroundColor: iconHover,
              focusRingColor: accentColor,
              backgroundColor: buttonBg,
              border: `1px solid ${borderColor}`
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = iconHover}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = buttonBg}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
                fill={accentColor}
              />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="flex-1 py-3 px-0 bg-transparent border-none focus:outline-none placeholder-opacity-40 focus:placeholder-opacity-20 transition-all theme-transition"
            style={{
              fontFamily: "'Fira Sans', sans-serif",
              fontSize: '16px',
              color: textPrimary,
              borderBottom: inputValue ? `2px solid ${accentColor}` : '2px solid transparent',
              transition: 'border-color 0.3s ease',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
            aria-label="Message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            aria-label="Send message"
            className="touch-target p-3 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 transform active:scale-95 theme-transition"
            style={{ 
              activeBackgroundColor: iconHover,
              focusRingColor: accentColor
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = iconHover}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill={inputValue.trim() ? accentColor : borderColor}
              />
            </svg>
          </button>
          <button
            onClick={handleVoiceMessage}
            aria-label={isRecording ? "Stop recording" : "Voice message"}
            className="touch-target p-3 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 theme-transition"
            style={{ 
              activeBackgroundColor: iconHover,
              focusRingColor: accentColor,
              backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.3)' : buttonBg,
              border: `1px solid ${borderColor}`
            }}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = iconHover}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = isRecording ? 'rgba(239, 68, 68, 0.3)' : buttonBg}
          >
            {isRecording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="#ef4444" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
                  fill={accentColor}
                />
              </svg>
            )}
          </button>
        </div>

        </div>

      </div>

    </div>
    </>
  );
}

