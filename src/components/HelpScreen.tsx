import { useTheme } from '../contexts/ThemeContext';

interface HelpScreenProps {
  isVisible: boolean;
  onBack: () => void;
}

export default function HelpScreen({ isVisible, onBack }: HelpScreenProps) {
  const { theme } = useTheme();

  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.6)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const iconColor = theme === 'dark' ? '#FFFFFF' : '#3A3A3A';

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
      
      {/* Multiple organic clouds - Fixed position, outside scrollable container */}
      <div className="cloud-wrapper">
        <img src="/assets/cloud.png" alt="" className="cloud" />
        <img src="/assets/cloud.png" alt="" className="cloud-middle" />
        <img src="/assets/cloud.png" alt="" className="cloud-lower" />
      </div>
      
      <div className="absolute inset-0 h-screen w-full overflow-y-auto safe-top safe-bottom pb-32 transition-colors duration-300 scrollable-container" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', overscrollBehavior: 'contain', touchAction: 'pan-y', paddingBottom: 'max(128px, env(safe-area-inset-bottom) + 80px)', backgroundColor: bgColor }}>
        {/* Header */}
        <div className="backdrop-blur-xl border-b px-4 py-3 shadow-sm safe-top relative z-20 transition-colors duration-300" style={{ backgroundColor: theme === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 245, 242, 0.8)', borderColor: borderColor }}>
          <div className="flex items-center gap-3">
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
            <div className="flex-1">
              <h1
                className="text-[20px] font-medium transition-colors duration-300"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
              >
                Help & Support
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Getting Started
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                Welcome to TARA! Start by making your first voice call to experience our AI companion. You can also explore journaling, mood tracking, and assessments to get personalized insights.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Voice Calls
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed">• Click the "Call" button to start a conversation</li>
                <li className="text-[14px] leading-relaxed">• Allow microphone access when prompted</li>
                <li className="text-[14px] leading-relaxed">• Speak naturally - TARA will listen and respond</li>
                <li className="text-[14px] leading-relaxed">• Use the mute button to pause your microphone</li>
                <li className="text-[14px] leading-relaxed">• Calls are tracked for your usage statistics</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Subscription Plans
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                Choose from our Free Trial, Basic, Pro, or Premium plans. Each plan includes different amounts of call time. You can upgrade or manage your subscription anytime from your profile.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Features
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed"><strong style={{ color: textPrimary }}>Journal:</strong> Record your thoughts and feelings</li>
                <li className="text-[14px] leading-relaxed"><strong style={{ color: textPrimary }}>Mood Tracking:</strong> Track your emotional state over time</li>
                <li className="text-[14px] leading-relaxed"><strong style={{ color: textPrimary }}>Assessments:</strong> Take mental health assessments</li>
                <li className="text-[14px] leading-relaxed"><strong style={{ color: textPrimary }}>Insights:</strong> View personalized health insights</li>
                <li className="text-[14px] leading-relaxed"><strong style={{ color: textPrimary }}>Self-Care Tools:</strong> Access breathing exercises and relaxation tools</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Troubleshooting
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Microphone not working:</strong> Check browser permissions and ensure your device microphone is enabled</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Call not starting:</strong> Check your internet connection and remaining call time</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Data not updating:</strong> Use the refresh button in your profile or reload the page</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Payment issues:</strong> Contact support if you experience payment problems</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Contact Support
              </h3>
              <p className="text-[14px] leading-relaxed mb-2" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                Need more help? Contact our support team:
              </p>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", color: accentColor }}>
                Email: support@tara.mindspace.ai
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

