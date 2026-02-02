import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export interface ChatHistory {
  id: string;
  preview: string;
  timestamp: Date;
  lastMessage: string;
}

interface ChatSidebarProps {
  isVisible: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onOpenChat: (chatId: string) => void;
}

// Mock recent chats data
const mockRecentChats: ChatHistory[] = [
  {
    id: 'chat-1',
    preview: 'How are you feeling today?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lastMessage: 'I understand. Let\'s work through this together.'
  },
  {
    id: 'chat-2',
    preview: 'Tell me about your day',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    lastMessage: 'That sounds challenging. How did that make you feel?'
  },
  {
    id: 'chat-3',
    preview: 'What\'s on your mind?',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    lastMessage: 'Thank you for sharing that with me.'
  },
  {
    id: 'chat-4',
    preview: 'Let\'s talk about stress management',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastMessage: 'Remember to take deep breaths when you feel overwhelmed.'
  },
  {
    id: 'chat-5',
    preview: 'Coping with anxiety',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    lastMessage: 'Anxiety is a normal response. Let\'s explore some techniques together.'
  },
  {
    id: 'chat-6',
    preview: 'Building self-confidence',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    lastMessage: 'You\'re stronger than you think. Let\'s work on this step by step.'
  }
];

export default function ChatSidebar({ isVisible, onClose, onNewChat, onOpenChat }: ChatSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const bgSidebar = theme === 'dark' ? 'rgba(26, 26, 26, 0.98)' : 'rgba(247, 245, 242, 0.98)';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#5A5A5A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const bgHover = theme === 'dark' ? 'rgba(122, 138, 122, 0.15)' : 'rgba(162, 173, 156, 0.1)';
  const bgActive = theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)';
  const bgIcon = theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)';
  const iconFill = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const avatarFill = theme === 'dark' ? '#E5E5E5' : '#F7F5F2';
  const headerBg = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.6)';

  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 bottom-0 w-80 backdrop-blur-md shadow-2xl border-r z-50 transition-transform duration-300 ease-out overflow-hidden theme-transition"
        style={{ 
          backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(247, 245, 242, 0.95)', 
          borderColor: borderColor,
          transform: isVisible ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b theme-transition safe-top" style={{ 
          backgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.4)', 
          borderColor: borderColor,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[20px] font-semibold theme-transition"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: textPrimary
              }}
            >
              Conversations
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors touch-target focus:outline-none focus:ring-2 theme-transition"
              style={{ 
                activeBackgroundColor: bgHover,
                focusRingColor: accentColor
              }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = bgHover}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                  fill={textPrimary}
                />
              </svg>
            </button>
          </div>

          {/* New Chat Button - Glossy Design */}
          <button
            onClick={() => {
              onNewChat();
            }}
            className="w-full px-4 py-3 rounded-2xl transition-all duration-300 flex items-center gap-3 touch-target theme-transition shadow-lg hover:shadow-xl"
            style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.3)'}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.35)' : 'rgba(162, 173, 156, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(0) scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-1px) scale(1)'}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center theme-transition shadow-md ring-2 ring-white/20" style={{ 
              backgroundColor: theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  fill={avatarFill}
                />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-base theme-transition" style={{ color: textPrimary }}>New Chat</div>
              <div className="text-xs font-light theme-transition" style={{ color: textSecondary }}>Start a fresh conversation</div>
            </div>
          </button>
        </div>

        {/* Recent Chats List */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] px-2 py-2 scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y' }}>
          <div className="px-3 py-2 mb-2">
            <h3 className="text-xs font-medium uppercase tracking-wide theme-transition" style={{ color: textSecondary }}>Recent Chats</h3>
          </div>
          
          {mockRecentChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                onOpenChat(chat.id);
              }}
              className="w-full px-3 py-3 rounded-2xl text-left transition-all duration-300 mb-2 touch-target theme-transition shadow-md hover:shadow-lg"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.4)' : 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${theme === 'dark' ? 'rgba(100, 100, 100, 0.2)' : 'rgba(212, 209, 202, 0.3)'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.2)' : 'rgba(162, 173, 156, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.4)' : 'rgba(162, 173, 156, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.4)' : 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.2)' : 'rgba(212, 209, 202, 0.3)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(0) scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px) scale(1)'}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-md ring-2 ${theme === 'dark' ? 'from-[#4A5A4A] to-[#3A4A3A] ring-white/10' : 'from-[#A2AD9C] to-[#98A392] ring-white/30'}`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill={avatarFill}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm truncate theme-transition" style={{ color: textPrimary }}>TARA</div>
                    <div className="text-xs font-light ml-2 flex-shrink-0 theme-transition" style={{ color: textSecondary }}>
                      {formatTime(chat.timestamp)}
                    </div>
                  </div>
                  <div className="text-xs font-light line-clamp-2 theme-transition" style={{ color: textSecondary }}>
                    {chat.lastMessage}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

