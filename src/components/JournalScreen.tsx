import { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface JournalScreenProps {
  isVisible: boolean;
  onBack?: () => void;
}

interface JournalEntry {
  id: string;
  date: Date;
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
}

export default function JournalScreen({ isVisible, onBack }: JournalScreenProps) {
  const { theme } = useTheme();
  
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
  
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: new Date(),
      content: 'Today I felt grateful for the small moments of peace...',
      mood: 'grateful',
      tags: ['gratitude']
    }
  ]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryTitle, setNewEntryTitle] = useState('');

  if (!isVisible) return null;

  // Theme-aware colors
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgHeader = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.95)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const bgInput = theme === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.95)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#6A7A6A';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const buttonBg = theme === 'dark' ? accentColor : accentColor;
  const buttonText = theme === 'dark' ? '#FFFFFF' : '#F7F5F2';
  const cancelButtonBg = theme === 'dark' ? 'rgba(60, 60, 60, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const cancelButtonText = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';

  const handleNewEntry = () => {
    setIsEditing(true);
    setSelectedEntry(null);
    setNewEntryContent('');
    setNewEntryTitle('');
  };

  const handleSaveEntry = () => {
    if (newEntryContent.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date(),
        title: newEntryTitle || undefined,
        content: newEntryContent,
        mood: undefined,
        tags: []
      };
      setEntries([entry, ...entries]);
      setNewEntryContent('');
      setNewEntryTitle('');
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedEntry(null);
    setNewEntryContent('');
    setNewEntryTitle('');
  };

  const prompts = [
    { id: 'gratitude', text: 'What are you grateful for today?', category: 'Pause & reflect' },
    { id: 'intentions', text: 'How do you want to feel today?', category: 'Set intentions' },
    { id: 'reflection', text: 'What did you learn about yourself today?', category: 'Reflect' },
    { id: 'challenges', text: 'What challenges did you face today?', category: 'Reflect' }
  ];

  const handleUsePrompt = (prompt: string) => {
    setIsEditing(true);
    setNewEntryContent(prompt + '\n\n');
  };

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
      
    <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-20 theme-transition scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', backgroundColor: bgColor }}>

      {/* Header */}
      <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 theme-transition" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target flex-shrink-0 theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>
          )}
          <div className="flex-1">
            <h1
              className="text-[20px] font-medium theme-transition"
              style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
            >
              Personal Journal
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 safe-bottom relative z-10">
        {isEditing ? (
          /* Entry Editor */
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full px-4 py-3 backdrop-blur-sm border rounded-2xl placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all theme-transition"
                style={{
                  fontFamily: "'Fira Sans', sans-serif",
                  fontSize: '16px',
                  backgroundColor: bgInput,
                  borderColor: borderColor,
                  color: textPrimary,
                  placeholderColor: textSecondary,
                  '--tw-ring-color': `${accentColor}20`
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.borderColor = accentColor;
                  e.target.style.boxShadow = `0 0 0 2px ${accentColor}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = borderColor;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <textarea
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                placeholder="Write your thoughts..."
                rows={12}
                className="w-full px-4 py-3 backdrop-blur-sm border rounded-2xl placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all resize-none theme-transition"
                style={{
                  fontFamily: "'Fira Sans', sans-serif",
                  fontSize: '15px',
                  lineHeight: '1.6',
                  backgroundColor: bgInput,
                  borderColor: borderColor,
                  color: textPrimary,
                  placeholderColor: textSecondary,
                  '--tw-ring-color': `${accentColor}20`
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.borderColor = accentColor;
                  e.target.style.boxShadow = `0 0 0 2px ${accentColor}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = borderColor;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveEntry}
                className="flex-1 px-5 py-3 rounded-full font-medium transition-all shadow-sm active:scale-95 touch-target theme-transition"
                style={{ 
                  fontFamily: "'Fira Sans', sans-serif",
                  backgroundColor: buttonBg,
                  color: buttonText
                }}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 border px-5 py-3 rounded-full font-medium transition-all shadow-sm active:scale-95 touch-target theme-transition"
                style={{ 
                  fontFamily: "'Fira Sans', sans-serif",
                  backgroundColor: cancelButtonBg,
                  borderColor: borderColor,
                  color: cancelButtonText
                }}
                onMouseDown={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseUp={(e) => e.currentTarget.style.opacity = '1'}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Guided Prompts */}
            <div className="mb-6">
              <h2
                className="text-[18px] font-medium mb-4 theme-transition"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                Guided Prompts
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {prompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleUsePrompt(prompt.text)}
                    className="backdrop-blur-sm border rounded-2xl p-4 transition-all duration-200 shadow-sm active:shadow-md text-left touch-target theme-transition"
                    style={{
                      backgroundColor: bgCard,
                      borderColor: borderColor
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(60, 60, 60, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                      e.currentTarget.style.borderColor = accentColor;
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.backgroundColor = bgCard;
                      e.currentTarget.style.borderColor = borderColor;
                    }}
                  >
                    <div
                      className="text-xs font-medium mb-1 theme-transition"
                      style={{ fontFamily: "'Fira Sans', sans-serif", color: accentColor }}
                    >
                      {prompt.category}
                    </div>
                    <div
                      className="text-sm font-light theme-transition"
                      style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
                    >
                      {prompt.text}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entries List */}
            <div>
              <h2
                className="text-[18px] font-medium mb-4 theme-transition"
                style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
              >
                Your Entries
              </h2>
              {entries.length === 0 ? (
                <div className="backdrop-blur-sm border rounded-2xl p-8 text-center theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
                  <p
                    className="font-light theme-transition"
                    style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                  >
                    No entries yet. Start your first journal entry!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="w-full backdrop-blur-sm border rounded-2xl p-4 transition-all duration-200 shadow-sm active:shadow-md text-left touch-target theme-transition"
                      style={{
                        backgroundColor: bgCard,
                        borderColor: borderColor
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(60, 60, 60, 0.8)' : 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = accentColor;
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = bgCard;
                        e.currentTarget.style.borderColor = borderColor;
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="text-xs font-light theme-transition"
                          style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                        >
                          {entry.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {entry.mood && (
                          <span className="text-lg">{entry.mood}</span>
                        )}
                      </div>
                      {entry.title && (
                        <h3
                          className="text-[16px] font-medium mb-1 theme-transition"
                          style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}
                        >
                          {entry.title}
                        </h3>
                      )}
                      <p
                        className="text-sm font-light line-clamp-2 theme-transition"
                        style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}
                      >
                        {entry.content}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button - Add New Entry */}
      {!isEditing && (
        <button
          onClick={handleNewEntry}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all touch-target z-40 safe-bottom theme-transition"
          style={{ 
            bottom: 'max(24px, env(safe-area-inset-bottom) + 24px)',
            background: `linear-gradient(to bottom right, ${accentColor}, ${accentLight})`,
            boxShadow: theme === 'dark' 
              ? `0 8px 24px ${accentColor}40, 0 4px 12px ${accentColor}30`
              : '0 8px 24px rgba(162, 173, 156, 0.4), 0 4px 12px rgba(162, 173, 156, 0.3)'
          }}
          aria-label="Add new journal entry"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
    </>
  );
}

