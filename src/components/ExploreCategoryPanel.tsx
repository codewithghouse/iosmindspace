import React, { useEffect, useRef } from 'react';
import ScrollList from './ScrollList';
import { useTheme } from '../contexts/ThemeContext';

interface Category {
  id: string;
  label: string;
}

interface ExploreCategoryPanelProps {
  activeCard: 'selfcare' | 'tools' | 'articles' | null;
  categories: Category[];
  cardIcon: React.ReactNode;
  cardTitle: string;
  onClose: () => void;
  onCategorySelect: (cardType: 'selfcare' | 'tools' | 'articles', categoryId: string) => void;
}

export default function ExploreCategoryPanel({
  activeCard,
  categories,
  cardIcon,
  cardTitle,
  onClose,
  onCategorySelect
}: ExploreCategoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isVisible = activeCard !== null;
  const { theme } = useTheme();

  const bgPanel = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const textPrimary = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const textSecondary = theme === 'dark' ? '#B0B0B0' : '#5A5A5A';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.3)' : 'rgba(212, 209, 202, 0.5)';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#A2AD9C';
  const bgCard = theme === 'dark' ? 'rgba(40, 40, 40, 0.6)' : 'rgba(255, 255, 255, 0.6)';
  const bgActive = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)';
  const iconColor = theme === 'dark' ? '#E5E5E5' : '#3A3A3A';
  const iconBg = theme === 'dark' ? 'rgba(122, 138, 122, 0.25)' : 'rgba(162, 173, 156, 0.2)';

  // Handle escape key to close panel
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Panel */}
      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-50 
                   transform transition-transform duration-300 ease-out theme-transition
                   ${isVisible ? 'translate-y-0' : 'translate-y-full'}
                   safe-bottom`}
        style={{ backgroundColor: bgPanel }}
        style={{
          maxHeight: '90vh',
          height: '90vh'
        }}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 border-b px-4 py-4 z-10 rounded-t-3xl theme-transition" style={{ backgroundColor: bgPanel, borderColor: borderColor }}>
          <div className="flex items-center gap-3 mb-3">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all touch-target theme-transition"
              style={{ activeBackgroundColor: theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
              onMouseDown={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(40, 40, 40, 0.8)' : 'rgba(255, 255, 255, 0.8)'}
              onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill={iconColor} />
              </svg>
            </button>

            {/* Card Icon */}
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 theme-transition" style={{ backgroundColor: iconBg }}>
              {cardIcon}
            </div>

            {/* Card Title */}
            <h2
              className="text-[20px] font-medium flex-1 theme-transition"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                color: textPrimary
              }}
            >
              {cardTitle}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-hidden" style={{ height: 'calc(90vh - 100px)' }}>
          <ScrollList
            data={categories}
            itemHeight={72}
            renderItem={(category: Category, index: number) => (
              <button
                onClick={() => activeCard && onCategorySelect(activeCard, category.id)}
                className="w-full px-4 py-4 mx-4 my-2 flex justify-between items-center
                           backdrop-blur-sm border 
                           rounded-xl shadow-sm transition-all touch-target theme-transition"
                style={{ 
                  minHeight: '72px',
                  backgroundColor: bgCard,
                  borderColor: borderColor
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = bgActive;
                  e.currentTarget.style.borderColor = accentColor;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = bgCard;
                  e.currentTarget.style.borderColor = borderColor;
                }}
              >
                <span
                  className="text-[15px] font-medium theme-transition"
                  style={{ 
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif',
                    color: textPrimary
                  }}
                >
                  {category.label}
                </span>
                <span className="text-xl theme-transition" style={{ color: textSecondary }}>›</span>
              </button>
            )}
          />
        </div>
      </div>
    </>
  );
}

