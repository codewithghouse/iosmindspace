import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

type MessageType = 'ai' | 'user';

interface ChatMessageProps {
  type: MessageType;
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ type, content, isStreaming = false }: ChatMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (isStreaming && type === 'ai') {
      if (currentIndex < content.length) {
        const timer = setTimeout(() => {
          setDisplayedContent(content.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }, 20); // Adjust speed here (lower = faster)
        return () => clearTimeout(timer);
      }
    } else {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
    }
  }, [content, currentIndex, isStreaming, type]);

  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const userMessageBg = theme === 'dark' ? accentColor : accentColor;
  const userMessageText = theme === 'dark' ? '#FFFFFF' : '#F7F5F2';

  return (
    <div className={`flex ${type === 'ai' ? 'justify-start' : 'justify-end'} mb-5 message-enter`} style={{ animationDelay: isVisible ? '0ms' : '0ms' }}>
      <div className={`flex items-start gap-3 max-w-[85%] sm:max-w-[80%] ${type === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
        {type === 'ai' && (
          <div className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 status-pulse theme-transition" style={{ backgroundColor: accentColor }} aria-hidden="true" />
        )}
        <div className="flex flex-col">
          {type === 'ai' ? (
            <div
              className="break-words theme-transition"
              style={{
                fontFamily: "'Fira Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.65',
                fontWeight: 400,
                wordBreak: 'break-word',
                color: textPrimary
              }}
            >
              {displayedContent}
              {isStreaming && currentIndex < content.length && (
                <span className="inline-block w-0.5 h-4 ml-1.5 animate-pulse align-middle theme-transition" style={{ backgroundColor: accentColor }} />
              )}
            </div>
          ) : (
            <div
              className="px-4 py-3 rounded-2xl shadow-sm rounded-tr-sm break-words theme-transition"
              style={{
                fontFamily: "'Fira Sans', sans-serif",
                fontSize: '16px',
                lineHeight: '1.5',
                fontWeight: 400,
                wordBreak: 'break-word',
                backgroundColor: userMessageBg,
                color: userMessageText
              }}
            >
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

