import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppState } from '../../contexts/AppStateContext';
import heroImg from '../../assets/images/hero_listening.png';

export const HeroCard: React.FC = () => {
    const { theme } = useTheme();
    const { navigateToChat } = useAppState();

    const isDark = theme === 'dark';

    return (
        <div
            className="w-full rounded-[32px] relative overflow-hidden mb-6 flex items-center justify-between shadow-xl"
            style={{
                background: isDark
                    ? 'linear-gradient(135deg, #A89F81, #7D745E)' // Muted sand gold for dark mode
                    : '#FAD7A0', // Warm pastel orange/yellow matching ref
                boxShadow: isDark
                    ? '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.1)'
                    : '0 15px 35px -10px rgba(250, 215, 160, 0.6), 0 0 0 1px rgba(255,255,255,0.5) inset',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)',
                minHeight: '180px',
                padding: '24px'
            }}
        >
            {/* Text Content */}
            <div className="flex flex-col z-10 max-w-[60%]">
                <h2
                    className="text-2xl font-bold mb-3 leading-tight"
                    style={{
                        color: '#2C3E50', // Dark slate for contrast on yellow
                        textShadow: '0 1px 0 rgba(255,255,255,0.2)'
                    }}
                >
                    Brain won't shut up?
                </h2>

                <button
                    onClick={navigateToChat}
                    className="px-6 py-3 rounded-full font-semibold text-sm transition-transform active:scale-95 shadow-md flex items-center gap-2 w-fit"
                    style={{
                        backgroundColor: '#1E5128', // Deep forest/sage green from ref
                        color: '#FFFFFF',
                    }}
                >
                    I'm here to listen
                </button>
            </div>

            {/* Hero Illustration */}
            <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[220px]">
                <img
                    src={heroImg}
                    alt="Listening"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{
                        filter: isDark ? 'brightness(0.9)' : 'none',
                        transform: 'rotate(-5deg)',
                        mixBlendMode: 'multiply'
                    }}
                />
            </div>
        </div>
    );
};
