import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../firebase-config';
import type { Schedule, ClassPeriod } from '../../types';

type ShiftType = 'firstShift' | 'secondShift';

interface UseAdminScheduleReturn {
  schedule: Schedule | null;
  isLoading: boolean;
  error: string | null;
  updatePeriod: (shift: ShiftType, index: number, period: ClassPeriod) => Promise<void>;
  addPeriod: (shift: ShiftType, period: ClassPeriod) => Promise<void>;
  deletePeriod: (shift: ShiftType, index: number) => Promise<void>;
  reorderPeriods: (shift: ShiftType, periods: ClassPeriod[]) => Promise<void>;
  clearError: () => void;
}

export function useAdminSchedule(): UseAdminScheduleReturn {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!database) {
      setError('Firebase baza nije inicijalizovana');
      setIsLoading(false);
      return;
    }

    const scheduleRef = ref(database, 'schedule');

    const unsubscribe = onValue(
      scheduleRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSchedule({
            firstShift: Array.isArray(data.firstShift) ? data.firstShift : [],
            secondShift: Array.isArray(data.secondShift) ? data.secondShift : [],
          });
        } else {
          setSchedule({ firstShift: [], secondShift: [] });
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Greška pri učitavanju rasporeda:', err);
        setError('Greška pri učitavanju rasporeda');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updatePeriod = useCallback(
    async (shift: ShiftType, index: number, period: ClassPeriod): Promise<void> => {
      if (!database) {
        setError('Firebase baza nije inicijalizovana');
        return;
      }

      try {
        const periodRef = ref(database, `schedule/${shift}/${index}`);
        await set(periodRef, period);
        setError(null);
      } catch (err) {
        console.error('Greška pri ažuriranju časa:', err);
        setError('Greška pri ažuriranju časa');
        throw err;
      }
    },
    []
  );

  const addPeriod = useCallback(
    async (shift: ShiftType, period: ClassPeriod): Promise<void> => {
      if (!database || !schedule) {
        setError('Firebase baza nije inicijalizovana');
        return;
      }

      try {
        const currentShift = schedule[shift] || [];
        const newShift = [...currentShift, period];
        const shiftRef = ref(database, `schedule/${shift}`);
        await set(shiftRef, newShift);
        setError(null);
      } catch (err) {
        console.error('Greška pri dodavanju časa:', err);
        setError('Greška pri dodavanju časa');
        throw err;
      }
    },
    [schedule]
  );

  const deletePeriod = useCallback(
    async (shift: ShiftType, index: number): Promise<void> => {
      if (!database || !schedule) {
        setError('Firebase baza nije inicijalizovana');
        return;
      }

      try {
        const currentShift = [...(schedule[shift] || [])];
        currentShift.splice(index, 1);
        const shiftRef = ref(database, `schedule/${shift}`);
        await set(shiftRef, currentShift);
        setError(null);
      } catch (err) {
        console.error('Greška pri brisanju časa:', err);
        setError('Greška pri brisanju časa');
        throw err;
      }
    },
    [schedule]
  );

  const reorderPeriods = useCallback(
    async (shift: ShiftType, periods: ClassPeriod[]): Promise<void> => {
      if (!database) {
        setError('Firebase baza nije inicijalizovana');
        return;
      }

      try {
        const shiftRef = ref(database, `schedule/${shift}`);
        await set(shiftRef, periods);
        setError(null);
      } catch (err) {
        console.error('Greška pri preraspoređivanju časova:', err);
        setError('Greška pri preraspoređivanju časova');
        throw err;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    schedule,
    isLoading,
    error,
    updatePeriod,
    addPeriod,
    deletePeriod,
    reorderPeriods,
    clearError,
  };
}
