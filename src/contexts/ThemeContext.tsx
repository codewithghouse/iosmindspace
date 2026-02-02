import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeMode = 'auto' | 'manual';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Function to determine theme based on current time
const getThemeFromTime = (): Theme => {
  const hour = new Date().getHours();
  // Light theme from 6 AM to 6 PM (6:00 - 17:59)
  // Dark theme from 6 PM to 6 AM (18:00 - 5:59)
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'auto';
  });

  const [manualTheme, setManualTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    if (themeMode === 'auto') {
      return getThemeFromTime();
    }
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'dark';
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set up time-based theme updates
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const updateTheme = () => {
      if (themeMode === 'auto') {
        const timeBasedTheme = getThemeFromTime();
        setThemeState(timeBasedTheme);
        document.documentElement.setAttribute('data-theme', timeBasedTheme);
      } else {
        setThemeState(manualTheme);
        document.documentElement.setAttribute('data-theme', manualTheme);
      }
    };

    if (themeMode === 'auto') {
      // Update theme immediately
      updateTheme();

      // Check every minute for time-based changes
      intervalRef.current = setInterval(() => {
        const timeBasedTheme = getThemeFromTime();
        setThemeState(timeBasedTheme);
        document.documentElement.setAttribute('data-theme', timeBasedTheme);
      }, 60000); // Check every minute

      // Also check when the hour changes (more precise)
      const now = new Date();
      const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();
      
      const hourChangeTimeout = setTimeout(() => {
        updateTheme();
        // Then set up interval for hourly checks
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
          const timeBasedTheme = getThemeFromTime();
          setThemeState(timeBasedTheme);
          document.documentElement.setAttribute('data-theme', timeBasedTheme);
        }, 3600000); // Check every hour
      }, msUntilNextHour);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        clearTimeout(hourChangeTimeout);
      };
    } else {
      // Manual mode - just set the theme
      updateTheme();
    }
  }, [themeMode, manualTheme]);

  // Initial theme setup
  useEffect(() => {
    if (themeMode === 'auto') {
      const timeBasedTheme = getThemeFromTime();
      setThemeState(timeBasedTheme);
      document.documentElement.setAttribute('data-theme', timeBasedTheme);
    } else {
      setThemeState(manualTheme);
      document.documentElement.setAttribute('data-theme', manualTheme);
    }
  }, []);

  // Save theme mode to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Save manual theme to localStorage when in manual mode
  useEffect(() => {
    if (themeMode === 'manual') {
      localStorage.setItem('theme', manualTheme);
    }
  }, [manualTheme, themeMode]);

  const toggleTheme = () => {
    if (themeMode === 'auto') {
      // Switch to manual mode with opposite of current time-based theme
      const newManualTheme = theme === 'light' ? 'dark' : 'light';
      setThemeModeState('manual');
      setManualTheme(newManualTheme);
      setThemeState(newManualTheme);
      document.documentElement.setAttribute('data-theme', newManualTheme);
    } else {
      // Toggle manual theme
      const newTheme = manualTheme === 'light' ? 'dark' : 'light';
      setManualTheme(newTheme);
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeModeState('manual');
    setManualTheme(newTheme);
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === 'auto') {
      const timeBasedTheme = getThemeFromTime();
      setThemeState(timeBasedTheme);
      document.documentElement.setAttribute('data-theme', timeBasedTheme);
    } else {
      setThemeState(manualTheme);
      document.documentElement.setAttribute('data-theme', manualTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

