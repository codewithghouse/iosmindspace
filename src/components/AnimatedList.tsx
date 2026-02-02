import React, { useRef, useState, useEffect, useCallback, ReactNode, MouseEventHandler, UIEvent } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.9, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="mb-3 cursor-pointer"
    >
      {children}
    </motion.div>
  );
};

interface ArticleItem {
  title: string;
  readTime?: string;
  category?: string;
  excerpt?: string;
}

interface AnimatedListProps {
  items?: string[] | ArticleItem[];
  onItemSelect?: (item: string | ArticleItem, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  items = [],
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = false,
  initialSelectedIndex = -1
}) => {
  const { theme } = useTheme();
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  // Theme-aware colors - Enhanced for better visibility
  const bgColor = theme === 'dark' ? '#1a1a1a' : '#F7F5F2';
  const bgCard = theme === 'dark' ? 'rgba(50, 50, 50, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const bgCardHover = theme === 'dark' ? 'rgba(60, 60, 60, 1)' : 'rgba(255, 255, 255, 1)';
  const bgCardSelected = theme === 'dark' ? 'rgba(70, 70, 70, 1)' : 'rgba(255, 255, 255, 1)';
  const borderColor = theme === 'dark' ? 'rgba(100, 100, 100, 0.6)' : 'rgba(162, 173, 156, 0.4)';
  const textPrimary = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const textSecondary = theme === 'dark' ? '#CCCCCC' : '#4A4A4A';
  const accentColor = theme === 'dark' ? '#7A8A7A' : '#7A8A7A';
  const accentLight = theme === 'dark' ? '#8A9A8A' : '#B2C2AC';
  const badgeBg = theme === 'dark' ? 'rgba(122, 138, 122, 0.3)' : 'rgba(162, 173, 156, 0.25)';
  const badgeText = theme === 'dark' ? '#9AAA9A' : '#A2AD9C';
  const scrollbarThumb = theme === 'dark' ? 'rgba(122, 138, 122, 0.5)' : 'rgba(162, 173, 156, 0.4)';
  const scrollbarHover = theme === 'dark' ? 'rgba(122, 138, 122, 0.7)' : 'rgba(162, 173, 156, 0.6)';

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: string | ArticleItem, index: number) => {
      setSelectedIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }
    },
    [onItemSelect]
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(items[selectedIndex], selectedIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth'
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  if (items.length === 0) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="backdrop-blur-sm border rounded-2xl p-8 text-center theme-transition" style={{ backgroundColor: bgCard, borderColor: borderColor }}>
          <p
            className="font-light theme-transition"
            style={{ 
              fontFamily: "'Fira Sans', sans-serif",
              color: textSecondary
            }}
          >
            No articles available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[calc(100vh-250px)] overflow-y-auto px-1 py-2 scrollable-container ${
          displayScrollbar ? '' : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: displayScrollbar ? `${scrollbarThumb} transparent` : 'transparent transparent'
        }}
        onMouseEnter={(e) => {
          if (displayScrollbar) {
            const style = document.createElement('style');
            style.textContent = `
              ${e.currentTarget.className}::-webkit-scrollbar { width: 6px; }
              ${e.currentTarget.className}::-webkit-scrollbar-track { background: transparent; }
              ${e.currentTarget.className}::-webkit-scrollbar-thumb { 
                background: ${scrollbarThumb}; 
                border-radius: 3px; 
              }
              ${e.currentTarget.className}::-webkit-scrollbar-thumb:hover { 
                background: ${scrollbarHover}; 
              }
            `;
            document.head.appendChild(style);
          }
        }}
      >
        {items.map((item, index) => {
          const isArticleItem = typeof item === 'object' && item !== null && 'title' in item;
          const articleItem = isArticleItem ? item as ArticleItem : null;
          const displayText = isArticleItem ? (articleItem?.title ?? '') : (item as string);
          
          return (
            <AnimatedItem
              key={index}
              delay={index * 0.05}
              index={index}
              onMouseEnter={() => handleItemMouseEnter(index)}
              onClick={() => handleItemClick(item, index)}
            >
              <motion.div
                className={`p-4 backdrop-blur-sm border rounded-2xl transition-all duration-200 touch-target theme-transition ${itemClassName}`}
                style={{
                  backgroundColor: selectedIndex === index ? bgCardSelected : bgCard,
                  borderColor: selectedIndex === index ? accentColor : borderColor,
                  boxShadow: selectedIndex === index 
                    ? (theme === 'dark' ? '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)' : '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)')
                    : (theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)'),
                  transform: selectedIndex === index ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.backgroundColor = bgCardHover;
                    e.currentTarget.style.borderColor = accentLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedIndex !== index) {
                    e.currentTarget.style.backgroundColor = bgCard;
                    e.currentTarget.style.borderColor = borderColor;
                  }
                }}
                whileHover={{ scale: selectedIndex === index ? 1.02 : 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3
                  className="m-0 font-medium text-[16px] leading-snug mb-2 theme-transition"
                  style={{ 
                    fontFamily: "'Fira Sans', sans-serif",
                    color: textPrimary
                  }}
                >
                  {displayText}
                </h3>
                {articleItem && (
                  <>
                    {articleItem.excerpt && (
                      <p
                        className="m-0 font-light text-[14px] leading-relaxed mb-2 theme-transition"
                        style={{ 
                          fontFamily: "'Fira Sans', sans-serif",
                          color: textSecondary
                        }}
                      >
                        {articleItem.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {articleItem.readTime && (
                        <span
                          className="text-[12px] font-light theme-transition"
                          style={{ 
                            fontFamily: "'Fira Sans', sans-serif",
                            color: textSecondary
                          }}
                        >
                          {articleItem.readTime}
                        </span>
                      )}
                      {articleItem.readTime && articleItem.category && (
                        <span className="text-[12px] theme-transition" style={{ color: textSecondary }}>•</span>
                      )}
                      {articleItem.category && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium theme-transition"
                          style={{ 
                            fontFamily: "'Fira Sans', sans-serif",
                            backgroundColor: badgeBg,
                            color: badgeText
                          }}
                        >
                          {articleItem.category}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatedItem>
          );
        })}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity, background: `linear-gradient(to bottom, ${bgColor}, transparent)` }}
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity, background: `linear-gradient(to top, ${bgColor}, transparent)` }}
          ></div>
        </>
      )}
    </div>
  );
};

export default AnimatedList;

