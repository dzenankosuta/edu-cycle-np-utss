import { useRef, useCallback } from 'react';
import { useWebSerialContext } from './useWebSerialContext';
import { type CurrentClass } from './useSchedule';

export const useBellSystem = () => {
  const lastTriggeredTime = useRef<number | null>(null);
  const { ringBell, isSupported, isConnected } = useWebSerialContext();

  const checkBellTime = useCallback((currentClass: CurrentClass, currentTime: Date) => {
    const currentTimeMs = currentTime.getTime();

    // Check if we should ring at start time
    const startTimeMs = currentClass.startTime.getTime();
    const endTimeMs = currentClass.endTime.getTime();

    // Ring at start
    if (
      Math.abs(currentTimeMs - startTimeMs) < 1000 &&
      lastTriggeredTime.current !== startTimeMs
    ) {
      console.log('🔔 Vreme za zvono - početak časa');
      lastTriggeredTime.current = startTimeMs;

      if (isConnected) {
        ringBell();
      } else {
        console.warn('🔔 Serial port nije povezan - zvono se neće aktivirati');
      }
    }

    // Ring at end
    if (
      Math.abs(currentTimeMs - endTimeMs) < 1000 &&
      lastTriggeredTime.current !== endTimeMs
    ) {
      console.log('🔔 Vreme za zvono - kraj časa');
      lastTriggeredTime.current = endTimeMs;

      if (isConnected) {
        ringBell();
      } else {
        console.warn('🔔 Serial port nije povezan - zvono se neće aktivirati');
      }
    }
  }, [ringBell, isConnected]);

  return {
    checkBellTime,
    isSupported,
    isConnected,
  };
};
