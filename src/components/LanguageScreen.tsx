import { useState, useEffect } from 'react';
import { getStoredLanguage, setStoredLanguage } from '../utils/storage';
import { useTheme } from '../contexts/ThemeContext';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export default function LanguageScreen({ isVisible, onContinue }: { isVisible: boolean; onContinue: () => void }) {
  const [selected, setSelected] = useState<string | null>(getStoredLanguage());
  const [opacity, setOpacity] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setOpacity(1), 100);
      const stored = getStoredLanguage();
      if (stored) {
        setSelected(stored);
      }
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
    }
  }, [isVisible]);

  const handleSelect = (code: string) => {
    setSelected(code);
    setStoredLanguage(code);
    setTimeout(() => {
      onContinue();
    }, 300);
  };

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#5A5A5A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const accentLight = theme === 'dark' ? '#6A7A6A' : '#98A392';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const bgSelected = theme === 'dark' ? accentColor : accentColor;
  const textSelected = theme === 'dark' ? '#E5E5E5' : '#F7F5F2';

  return (
    <div
      className="absolute inset-0 h-screen w-full flex items-center justify-center px-4 sm:px-6 transition-opacity duration-1000 ease-out safe-top safe-bottom theme-transition"
      style={{
        opacity: isVisible ? opacity : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        backgroundColor: bgColor
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center">
        <h2
          className="text-[20px] font-light mb-12 tracking-wide theme-transition"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            color: textPrimary
          }}
        >
          Choose your language
        </h2>

        <div className="w-full space-y-3" role="radiogroup" aria-label="Language selection">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              role="radio"
              aria-checked={selected === lang.code}
              aria-label={`Select ${lang.label}`}
              className={`
                w-full py-4 px-6 rounded-full touch-target
                transition-all duration-300 ease-out shadow-sm
                ${selected === lang.code
                  ? 'shadow-md'
                  : 'border'
                }
                active:shadow-md
                focus:outline-none focus:ring-2 focus:ring-offset-2
                active:scale-95 theme-transition
              `}
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                fontWeight: 400,
                letterSpacing: '0.3px',
                backgroundColor: selected === lang.code ? bgSelected : 'transparent',
                color: selected === lang.code ? textSelected : textPrimary,
                borderColor: selected === lang.code ? 'transparent' : borderColor,
                focusRingColor: accentColor
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <div className="mt-16">
          <img
            src={theme === 'dark' ? '/assets/mindspace_black.png' : '/assets/mindspace.png'}
            alt="mindspace.ai"
            className="h-5 opacity-30 theme-transition"
            style={{ transition: 'opacity 0.3s ease' }}
          />
        </div>
      </div>
    </div>
  );
}
