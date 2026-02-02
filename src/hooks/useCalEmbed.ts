import { useEffect, useRef } from 'react';
import { getCalApi } from '@calcom/embed-react';

export const useCalEmbed = () => {
  const calInitialized = useRef(false);

  useEffect(() => {
    if (calInitialized.current) return;

    (async function () {
      try {
        const cal = await getCalApi({ namespace: 'appointment' });
        cal('ui', {
          hideEventTypeDetails: false,
          layout: 'month_view',
          styles: {
            branding: {
              brandColor: '#7A8A7A',
              lightColor: '#F7F5F2',
              darkColor: '#1a1a1a',
            },
          },
        });
        calInitialized.current = true;
      } catch (error) {
        console.error('Error initializing Cal.com embed:', error);
      }
    })();
  }, []);

  const openCalBooking = () => {
    // Trigger Cal.com booking modal
    const calButton = document.querySelector('[data-cal-namespace="appointment"]') as HTMLElement;
    if (calButton) {
      calButton.click();
    }
  };

  return { openCalBooking };
};

