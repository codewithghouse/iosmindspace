import { useTheme } from '../contexts/ThemeContext';

interface PrivacyScreenProps {
  isVisible: boolean;
  onBack: () => void;
}

export default function PrivacyScreen({ isVisible, onBack }: PrivacyScreenProps) {
  const { theme } = useTheme();

  if (!isVisible) return null;

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.6)';
  const borderColor = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(212, 209, 202, 0.5)';
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
                Privacy & Security
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
          <div className="space-y-6">
            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Data Protection
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                Your privacy is important to us. We use industry-standard encryption to protect your personal information and conversation data. All data is stored securely and is only accessible to you.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Information We Collect
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed">• Account information (name, email, profile photo)</li>
                <li className="text-[14px] leading-relaxed">• Conversation history and call logs</li>
                <li className="text-[14px] leading-relaxed">• Journal entries and mood tracking data</li>
                <li className="text-[14px] leading-relaxed">• Assessment results and health insights</li>
                <li className="text-[14px] leading-relaxed">• Usage statistics and subscription information</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                How We Use Your Data
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                We use your data to provide personalized mental health support, improve our AI companion's responses, and enhance your experience. We never sell your data to third parties.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Your Rights
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed">• Access your personal data at any time</li>
                <li className="text-[14px] leading-relaxed">• Request deletion of your account and data</li>
                <li className="text-[14px] leading-relaxed">• Export your conversation history</li>
                <li className="text-[14px] leading-relaxed">• Opt-out of data collection (may limit features)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Security Measures
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                We implement multiple layers of security including SSL encryption, secure authentication, and regular security audits to protect your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

