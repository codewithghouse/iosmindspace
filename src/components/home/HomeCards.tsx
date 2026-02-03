import React from 'react';
import { FeatureCard } from '../shared/FeatureCard';
import { useAppState } from '../../contexts/AppStateContext';

// Import Premium Illustrations
import chatTaraImg from '../../assets/images/chat-tara.png';
import assessmentImg from '../../assets/images/assessment.png';
import appointmentImg from '../../assets/images/appointment.png';
import breathingImg from '../../assets/images/breathing.png';

export const GetStartedCards: React.FC = () => {
  const {
    navigateToChat,
    navigateToAssessments,
    navigateToBooking,
    navigateToBreathing,
  } = useAppState();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 1. Take Assessment (Soft Lavender) */}
      <FeatureCard
        id="assessments"
        title="Take Assessment"
        description="Check your wellness"
        imageSrc={assessmentImg}
        className="!bg-[#E8DAEF] dark:!bg-[#5B2C6F]"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToAssessments}
      />

      {/* 2. Book Appointment (Soft Apricot/Sand) */}
      <FeatureCard
        id="bookings"
        title="Book Appointment"
        description="Schedule session"
        imageSrc={appointmentImg}
        className="!bg-[#FAE5D3] dark:!bg-[#BA4A00]"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToBooking}
      />

      {/* 3. Say Hi to Tara (Soft Sky Blue) */}
      <FeatureCard
        id="tara"
        title="Say Hi to Tara!"
        description="Get instant support"
        imageSrc={chatTaraImg}
        className="!bg-[#D6EAF8] dark:!bg-[#2874A6]"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToChat}
      />

      {/* 4. Breathe with us (Soft Mint Green) */}
      <FeatureCard
        id="breathing"
        title="Breathe with us!"
        description="Find calm & peace"
        imageSrc={breathingImg}
        className="!bg-[#D5F5E3] dark:!bg-[#1E8449]"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
            <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
        }
        onClick={navigateToBreathing}
      />
    </div>
  );
};

export const QuickAccessCards: React.FC = () => {
  const {
    navigateToToolsSounds,
    navigateToSelfCare,
    navigateToJournal,
    navigateToArticles,
  } = useAppState();

  return (
    <div className="grid grid-cols-2 gap-4">
      <FeatureCard
        id="tools"
        title="Tools & Sounds"
        description="Relaxation audio"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToToolsSounds}
      />
      <FeatureCard
        id="selfcare"
        title="Self-Care Tips"
        description="Wellness guidance"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToSelfCare}
      />
      <FeatureCard
        id="journal"
        title="Mindful Journal"
        description="Personal reflections"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToJournal}
      />
      <FeatureCard
        id="articles"
        title="Mindful Articles"
        description="Educational content"
        icon={
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
              fill="currentColor"
            />
          </svg>
        }
        onClick={navigateToArticles}
      />
    </div>
  );
};

