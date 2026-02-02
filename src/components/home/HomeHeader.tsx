import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppState } from '../../contexts/AppStateContext';

export const HomeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { userName, navigateToProfile, navigateToCall } = useAppState();
  const [searchValue, setSearchValue] = useState('');

  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#4A4A4A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const iconColor = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';

  return (
    <div className="px-4 py-3 safe-top relative z-20 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Profile Picture */}
          <button
            onClick={() => navigateToProfile()}
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 touch-target transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              background: theme === 'dark' 
                ? 'linear-gradient(to bottom right, #7A8A7A, #6A7A6A)'
                : 'linear-gradient(to bottom right, #A2AD9C, #98A392)',
              focusRingColor: theme === 'dark' ? '#7A8A7A' : '#A2AD9C'
            }}
            aria-label="Navigate to profile"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
                fill={theme === 'dark' ? '#FFFFFF' : '#F7F5F2'}
              />
            </svg>
          </button>
          {/* Greeting */}
          <div>
            <h1
              className="text-[20px] font-medium transition-colors duration-300"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif', color: textPrimary }}
            >
              Hello, {userName}
            </h1>
          </div>
        </div>
        {/* Call Button */}
        <button
          onClick={() => navigateToCall()}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-2 touch-target relative theme-transition shadow-lg active:scale-95"
          style={{ 
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, #7A8A7A, #6A7A6A)'
              : 'linear-gradient(135deg, #A2AD9C, #98A392)',
            focusRingColor: accentColor,
            boxShadow: theme === 'dark'
              ? '0 4px 16px rgba(122, 138, 122, 0.4), 0 0 20px rgba(122, 138, 122, 0.2)'
              : '0 4px 16px rgba(162, 173, 156, 0.4), 0 0 20px rgba(162, 173, 156, 0.2)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
          aria-label="Start call with TARA"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
              fill={theme === 'dark' ? '#FFFFFF' : '#F7F5F2'}
            />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
              fill={textSecondary}
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search"
          className="w-full pl-10 pr-4 py-3 backdrop-blur-sm border rounded-2xl placeholder-opacity-50 focus:outline-none focus:ring-2 transition-all touch-target theme-transition"
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
            fontSize: '15px',
            backgroundColor: theme === 'dark' ? 'rgba(50, 50, 50, 0.6)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: borderColor,
            color: textPrimary
          }}
          aria-label="Search"
        />
      </div>
    </div>
  );
};

