import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppState } from '../../contexts/AppStateContext';

export const HomeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { userName, navigateToProfile, navigateToCall } = useAppState();

  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';

  return (
    <div className="px-5 mt-4 pb-2 relative z-20 transition-colors duration-300">

      {/* Top Row: Static Greeting & Call Button */}
      <div className="flex items-start justify-between mb-4">
        {/* Static Greeting */}
        <h1
          className="text-[22px] font-bold italic leading-tight max-w-[80%]"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: '#1A1A1A' // Always dark/black as per ref image, or adapt for dark mode if strictly needed, but ref implies dark text on white.
          }}
        >
          {theme === 'dark' ? <span style={{ color: '#E5E5E5' }}>Here for you always, in all ways :)</span> : "Here for you always, in all ways :)"}
        </h1>

        {/* Green Call Button */}
        <button
          onClick={() => navigateToCall()}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md"
          style={{
            backgroundColor: '#00C853', // Bright vibrant green
            boxShadow: '0 4px 12px rgba(0, 200, 83, 0.3)'
          }}
          aria-label="Start call with TARA"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill="#FFFFFF"
            />
          </svg>
        </button>
      </div>

      {/* Bottom Row: Avatar & Space Name */}
      <div className="flex items-center gap-3">
        {/* Profile Picture */}
        <button
          onClick={() => navigateToProfile()}
          className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm"
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userName || 'User'}`}
            alt="Profile"
            className="w-full h-full bg-blue-50"
          />
        </button>

        {/* Dynamic Space Name */}
        <span
          className="text-lg font-normal"
          style={{
            color: textPrimary,
            fontFamily: "'Inter', sans-serif"
          }}
        >
          {userName || 'User'}'s space
        </span>
      </div>

    </div>
  );
};

