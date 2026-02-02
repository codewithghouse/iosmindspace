import { useTheme } from '../contexts/ThemeContext';

interface AboutScreenProps {
  isVisible: boolean;
  onBack: () => void;
}

export default function AboutScreen({ isVisible, onBack }: AboutScreenProps) {
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
                About TARA
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-6 pb-24 safe-bottom relative z-10" style={{ paddingBottom: 'max(96px, env(safe-area-inset-bottom) + 60px)' }}>
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#A2AD9C] to-[#98A392] flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🧠</span>
              </div>
              <h3 className="text-[22px] font-semibold mb-2" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                TARA - Your AI Mental Health Companion
              </h3>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                Empowering your mental wellness journey
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Our Mission
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                TARA is designed to provide accessible, personalized mental health support through AI-powered conversations. We believe everyone deserves access to mental wellness resources, and we're here to support you on your journey.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                What TARA Offers
              </h3>
              <ul className="space-y-2 mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>24/7 Availability:</strong> Access support whenever you need it</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Personalized Conversations:</strong> AI-powered responses tailored to your needs</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Comprehensive Tools:</strong> Journaling, mood tracking, assessments, and more</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Privacy-Focused:</strong> Your conversations are confidential and secure</li>
                <li className="text-[14px] leading-relaxed">• <strong style={{ color: textPrimary }}>Evidence-Based:</strong> Built on mental health best practices</li>
              </ul>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Important Note
              </h3>
              <p className="text-[14px] leading-relaxed mb-4" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                TARA is designed to complement, not replace, professional mental health care. If you're experiencing a mental health emergency, please contact your local emergency services or a mental health professional immediately.
              </p>
            </div>

            <div>
              <h3 className="text-[18px] font-semibold mb-3" style={{ fontFamily: "'Fira Sans', sans-serif", color: textPrimary }}>
                Version Information
              </h3>
              <p className="text-[14px] leading-relaxed mb-2" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <strong style={{ color: textPrimary }}>App Version:</strong> 1.0.0
              </p>
              <p className="text-[14px] leading-relaxed mb-2" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <strong style={{ color: textPrimary }}>Platform:</strong> Web Application
              </p>
              <p className="text-[14px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                <strong style={{ color: textPrimary }}>Last Updated:</strong> {new Date().getFullYear()}
              </p>
            </div>

            <div className="pt-4 border-t" style={{ borderColor: borderColor }}>
              <p className="text-[12px] leading-relaxed text-center" style={{ fontFamily: "'Fira Sans', sans-serif", color: textSecondary }}>
                © {new Date().getFullYear()} TARA by Mindspace AI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

