import { useTheme } from '../contexts/ThemeContext';

interface VoiceCallEntryProps {
  time: string;
  duration: string;
  onViewTranscript?: () => void;
}

export default function VoiceCallEntry({ time, duration, onViewTranscript }: VoiceCallEntryProps) {
  const { theme } = useTheme();

  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const bgCard = theme === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#5A5A5A';
  const bgIcon = theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)';
  const buttonText = theme === 'dark' ? '#E5E5E5' : '#F7F5F2';

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2 max-w-[80%]">
        <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 theme-transition" style={{ backgroundColor: accentColor }} aria-hidden="true" />
        <div className="rounded-2xl rounded-tl-sm shadow-sm overflow-hidden theme-transition" style={{ backgroundColor: bgCard }}>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center theme-transition" style={{ backgroundColor: bgIcon }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                  fill={accentColor}
                />
              </svg>
            </div>
            <div className="flex-1">
              <div className="font-medium mb-1 theme-transition" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', fontSize: '15px', color: textPrimary }}>
                Voice Call
              </div>
              <div className="text-sm theme-transition" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textSecondary }}>
                {time} | {duration}
              </div>
            </div>
            {onViewTranscript && (
              <button
                onClick={onViewTranscript}
                className="px-3 py-1.5 rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 theme-transition"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                  backgroundColor: accentColor,
                  color: buttonText,
                  focusRingColor: accentColor
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
                aria-label="View transcript"
              >
                View Transcript
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

