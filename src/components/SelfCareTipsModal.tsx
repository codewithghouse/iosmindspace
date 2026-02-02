import { useEffect, useRef } from 'react';

interface SelfCareTipsModalProps {
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
  tips: string[];
  categoryIcon: React.ReactNode;
  onClose: () => void;
  onTalkToUs?: () => void;
}

export default function SelfCareTipsModal({
  isOpen,
  categoryId,
  categoryName,
  tips,
  categoryIcon,
  onClose,
  onTalkToUs
}: SelfCareTipsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstFocusable = modalRef.current.querySelector('button') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="fixed inset-0 z-[101] flex items-center justify-center p-4 safe-top safe-bottom"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="bg-[#F7F5F2] rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl transform transition-all duration-300 ease-out modal-enter"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Card - Dark Green */}
          <div className="bg-gradient-to-r from-[#8B9A85] to-[#7A8A75] rounded-t-3xl px-4 py-4 flex items-center gap-3 relative">
            {/* Icon Container - Light Green */}
            <div className="w-12 h-12 rounded-xl bg-[#A2AD9C] flex items-center justify-center flex-shrink-0 shadow-md">
              <div className="text-white scale-110">
                {categoryIcon}
              </div>
            </div>

            {/* Category Name */}
            <h2
              id="modal-title"
              className="text-[20px] text-white font-bold flex-1"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
            >
              {categoryName}
            </h2>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-all touch-target focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="white" />
              </svg>
            </button>
          </div>

          {/* Tips List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-5" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 border-2 border-[#A2AD9C]/30 shadow-sm"
                  style={{
                    animation: `fadeInUp 0.4s ease-out ${index * 80}ms both`
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Number Circle */}
                    <div className="w-8 h-8 rounded-full bg-[#8B9A85] flex items-center justify-center flex-shrink-0 shadow-md">
                      <span
                        className="text-white text-[14px] font-bold"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
                      >
                        {index + 1}
                      </span>
                    </div>

                    {/* Tip Text */}
                    <p
                      className="text-[15px] text-[#3A3A3A] font-light leading-relaxed flex-1 pt-0.5"
                      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
                    >
                      {tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Talk to Us Button */}
          <div className="px-4 pb-4 pt-2">
            <button
              onClick={() => {
                onClose();
                if (onTalkToUs) {
                  onTalkToUs();
                }
              }}
              className="w-full bg-gradient-to-r from-[#8B9A85] to-[#7A8A75] rounded-2xl py-4 px-4 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-all duration-200 touch-target focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#8B9A85]"
            >
              {/* Message Icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="white" />
                <path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z" fill="white" />
              </svg>

              {/* Button Text */}
              <span
                className="text-white text-[16px] font-semibold"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif' }}
              >
                Talk to Us
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

