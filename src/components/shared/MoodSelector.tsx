import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useMood, MOODS } from '../../hooks/useMood';

interface MoodSelectorProps {
  onMoodSelect?: (moodId: string) => void;
  showCurrentMood?: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  showCurrentMood = true
}) => {
  const { theme } = useTheme();
  const { currentMood, getMoodById, todayMood, isLoading } = useMood();

  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#4A4A4A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';

  const currentMoodData = currentMood ? getMoodById(currentMood) : null;

  if (isLoading) {
    return (
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3 theme-transition"
          style={{ color: textSecondary }}>
          Your Mood
        </h3>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 theme-transition animate-pulse"
            style={{ borderColor: borderColor }}>
            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: borderColor }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <h3 className="text-sm font-medium mb-3 theme-transition"
        style={{ color: textSecondary }}>
        Your Mood
      </h3>
      <div className="flex flex-col items-center gap-2">
        {showCurrentMood && currentMoodData ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all shadow-lg relative"
              style={{
                backgroundColor: currentMoodData.color.replace('bg-', ''),
                boxShadow: `0 4px 16px ${accentColor}60`,
                border: `2px solid ${accentColor}`
              }}
              aria-label={`Current mood: ${currentMoodData.label}`}
            >
              {currentMoodData.emoji}
              {todayMood && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2"
                  style={{ borderColor: theme === 'dark' ? '#1a1a1a' : '#F7F5F2' }}
                  title="Saved today" />
              )}
            </div>
            <span className="text-xs font-medium theme-transition"
              style={{ color: textPrimary }}>
              {currentMoodData.label}
            </span>
            {todayMood && (
              <span className="text-[10px] font-light theme-transition"
                style={{ color: textSecondary }}>
                Saved today
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => {
              const moodSelector = document.getElementById('mood-selector');
              if (moodSelector) {
                moodSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-dashed transition-all active:scale-95 touch-target theme-transition hover:border-solid"
            style={{ borderColor: borderColor, color: textSecondary }}
            aria-label="Select your mood"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const MoodList: React.FC<{ onMoodSelect?: (moodId: string) => void }> = ({ onMoodSelect }) => {
  const { theme } = useTheme();
  const { selectedMood, currentMood, selectMood, todayMood, isSaving, isLoading } = useMood();

  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#4A4A4A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';

  // Check if mood already selected today
  const isMoodSelectedToday = !!todayMood;
  const isDisabled = isMoodSelectedToday || isSaving || isLoading;

  // Use currentMood or selectedMood for highlighting (currentMood is the saved one, selectedMood is the one being selected)
  const highlightedMood = currentMood || selectedMood;

  return (
    <div className="mb-12" id="mood-selector">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[18px] font-medium transition-colors duration-300"
          style={{
            color: textPrimary
          }}
        >
          Daily mood log
        </h2>
        {isMoodSelectedToday && (
          <span
            className="text-xs font-light px-2 py-1 rounded-full theme-transition"
            style={{
              color: textSecondary,
              backgroundColor: theme === 'dark' ? 'rgba(100, 100, 100, 0.2)' : 'rgba(212, 209, 202, 0.3)',
            }}
          >
            Already logged today
          </span>
        )}
      </div>
      <div
        className="flex gap-3 pb-2 overflow-x-auto"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain',
          touchAction: 'pan-x',
          overflowY: 'hidden',
          width: '100%',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
          opacity: isDisabled ? 0.6 : 1,
          pointerEvents: isDisabled ? 'none' : 'auto'
        }}
      >
        {MOODS.map((mood) => {
          const isSelected = highlightedMood === mood.id;
          const moodColor = mood.color.replace('bg-', '');

          return (
            <button
              key={mood.id}
              onClick={() => {
                if (!isDisabled) {
                  selectMood(mood.id);
                  if (onMoodSelect) {
                    onMoodSelect(mood.id);
                  }
                }
              }}
              disabled={isDisabled}
              className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all touch-target theme-transition relative ${isSelected ? 'scale-110 ring-4' : 'active:scale-95'
                } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              aria-label={mood.label}
              style={{
                backgroundColor: isSelected ? moodColor : `${moodColor}80`,
                border: isSelected
                  ? `3px solid ${accentColor}`
                  : `2px solid ${isSelected ? accentColor : borderColor}`,
                boxShadow: isSelected
                  ? `0 6px 20px ${accentColor}60, 0 0 0 2px ${accentColor}40`
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s ease-in-out',
                opacity: isDisabled && !isSelected ? 0.5 : 1
              }}
            >
              {mood.emoji}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: accentColor,
                    border: `2px solid ${theme === 'dark' ? '#1a1a1a' : '#F7F5F2'}`
                  }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#FFFFFF" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {isMoodSelectedToday && (
        <p
          className="text-xs font-light mt-3 text-center theme-transition"
          style={{
            color: textSecondary,
          }}
        >
          You've already logged your mood today. Come back tomorrow!
        </p>
      )}
    </div>
  );
};
