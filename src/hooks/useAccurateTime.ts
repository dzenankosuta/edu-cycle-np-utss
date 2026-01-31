import { useState, useEffect, useCallback, useRef } from 'react';

interface TimeApiResponse {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  seconds: number;
  milliSeconds: number;
  dateTime: string;
}

interface UseAccurateTimeReturn {
  currentTime: Date;
  isApiTime: boolean;
  lastSync: Date | null;
}

export const useAccurateTime = (): UseAccurateTimeReturn => {
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isApiTime, setIsApiTime] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncTime = useCallback(async () => {
    try {
      const beforeFetch = Date.now();
      const response = await fetch(
        'https://timeapi.io/api/Time/current/zone?timeZone=Europe/Belgrade'
      );
      const afterFetch = Date.now();

      if (!response.ok) throw new Error('API error');

      const data: TimeApiResponse = await response.json();

      // Calculate network latency and adjust
      const networkDelay = (afterFetch - beforeFetch) / 2;

      // Parse API time
      const apiTime = new Date(
        data.year,
        data.month - 1, // JS months are 0-indexed
        data.day,
        data.hour,
        data.minute,
        data.seconds,
        data.milliSeconds
      );

      // Add half the network delay to approximate actual server time
      const adjustedApiTime = apiTime.getTime() + networkDelay;

      // Calculate offset from system time
      const systemTime = Date.now();
      const offset = adjustedApiTime - systemTime;

      setTimeOffset(offset);
      setIsApiTime(true);
      setLastSync(new Date());
      console.log(`✅ Time synced with API (offset: ${offset}ms)`);
    } catch (error) {
      console.warn('⚠️ Time API failed, using system time:', error);
      setIsApiTime(false);
    }
  }, []);

  // Initial sync and periodic re-sync
  useEffect(() => {
    syncTime();

    // Re-sync every 5 minutes
    syncIntervalRef.current = setInterval(syncTime, 5 * 60 * 1000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [syncTime]);

  // Update current time every second using offset
  useEffect(() => {
    const updateTime = () => {
      const correctedTime = new Date(Date.now() + timeOffset);
      setCurrentTime(correctedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [timeOffset]);

  return { currentTime, isApiTime, lastSync };
};
