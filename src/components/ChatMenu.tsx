import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export interface ChatHistory {
  id: string;
  preview: string;
  timestamp: Date;
  lastMessage: string;
}

interface ChatMenuProps {
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
  }
];

export default function ChatMenu({ isVisible, onClose, onNewChat, onOpenChat }: ChatMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const bgMenu = theme === 'dark' ? 'rgba(40, 40, 40, 0.95)' : 'rgba(255, 255, 255, 0.9)';
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

  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Dropdown */}
      <div
        ref={menuRef}
        className="absolute top-16 left-4 backdrop-blur-md rounded-2xl shadow-xl border z-50 w-80 max-h-[70vh] overflow-hidden animate-menuSlideDown theme-transition"
        style={{ backgroundColor: bgMenu, borderColor: borderColor }}
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif'
        }}
      >
        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full px-4 py-4 text-left transition-colors border-b flex items-center gap-3 touch-target theme-transition"
          style={{ borderColor: borderColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onMouseDown={(e) => e.currentTarget.style.backgroundColor = bgActive}
          onMouseUp={(e) => e.currentTarget.style.backgroundColor = bgHover}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center theme-transition" style={{ backgroundColor: bgIcon }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                fill={iconFill}
              />
            </svg>
          </div>
          <div>
            <div className="font-medium text-base theme-transition" style={{ color: textPrimary }}>New Chat</div>
            <div className="text-xs font-light theme-transition" style={{ color: textSecondary }}>Start a fresh conversation</div>
          </div>
        </button>

        {/* Recent Chats Section */}
        <div className="overflow-y-auto max-h-[calc(70vh-80px)]">
          <div className="px-4 py-3 border-b theme-transition" style={{ borderColor: borderColor }}>
            <h3 className="text-xs font-medium uppercase tracking-wide theme-transition" style={{ color: textSecondary }}>Recent Chats</h3>
          </div>
          
          {mockRecentChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                onOpenChat(chat.id);
                onClose();
              }}
              className="w-full px-4 py-4 text-left transition-colors border-b last:border-b-0 touch-target theme-transition"
              style={{ borderColor: borderColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = bgHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = bgActive}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = bgHover}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${theme === 'dark' ? 'from-[#4A5A4A] to-[#3A4A3A]' : 'from-[#A2AD9C] to-[#98A392]'} flex items-center justify-center flex-shrink-0`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                      fill={avatarFill}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm truncate theme-transition" style={{ color: textPrimary }}>TARA</div>
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

