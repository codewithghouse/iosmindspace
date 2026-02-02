import { motion } from 'framer-motion';

export default function PresenceScreen({ isExiting = false }: { isExiting?: boolean }) {

  // Use same splash screen (mind.jpg) for both light and dark themes
  const logoSrc = '/assets/mind.jpg';
  const backgroundColor = '#000000'; // Always black background
  const containerBgColor = '#000000'; // Always black container

  return (
    <div
      className="absolute inset-0 h-screen w-full overflow-hidden flex items-center justify-center safe-top safe-bottom z-50"
      style={{
        opacity: isExiting ? 0 : 1,
        pointerEvents: isExiting ? 'none' : 'auto',
        backgroundColor: backgroundColor,
        transition: 'opacity 0.25s ease-out, background-color 0.3s ease-out', // Smooth theme transition
        willChange: 'opacity'
      }}
    >
      {/* Circular container with logo - exactly matching Flutter app */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 0.1, // 100ms delay (matching Flutter)
          duration: 0.6, // 600ms duration (matching Flutter)
          ease: [0.42, 0, 0.58, 1] // easeInOut curve (matching Flutter Curves.easeInOut)
        }}
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '140px', // Circular (280/2 = 140) - matching Flutter
          backgroundColor: containerBgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          transition: 'background-color 0.3s ease-out' // Smooth theme transition
        }}
      >
        {/* Logo image - theme-aware */}
        <img
          src={logoSrc}
          alt="mindspace.ai"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover', // Cover to fill container (matching Flutter BoxFit.cover)
            objectPosition: 'center', // Center the image
            borderRadius: '140px',
            transition: 'opacity 0.3s ease-out' // Smooth image transition
          }}
          loading="eager"
        />
      </motion.div>
    </div>
  );
}
