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
  populateDefaultSchedule: () => Promise<void>;
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

  const populateDefaultSchedule = useCallback(async (): Promise<void> => {
    if (!database) {
      setError('Firebase baza nije inicijalizovana');
      return;
    }

    try {
      const defaultSchedule: Schedule = {
        firstShift: [
          { class: '1. čas', start: '07:00', end: '07:45' },
          { class: '2. čas', start: '07:50', end: '08:35' },
          { class: '3. čas', start: '08:40', end: '09:25' },
          { class: 'Veliki odmor', start: '09:25', end: '09:45' },
          { class: '4. čas', start: '09:50', end: '10:35' },
          { class: '5. čas', start: '10:40', end: '11:25' },
          { class: '6. čas', start: '11:30', end: '12:15' },
          { class: '7. čas', start: '12:20', end: '13:00' },
        ],
        secondShift: [
          { class: '1. čas', start: '13:10', end: '14:00' },
          { class: '2. čas', start: '14:05', end: '14:50' },
          { class: '3. čas', start: '14:55', end: '15:40' },
          { class: 'Veliki odmor', start: '15:40', end: '16:00' },
          { class: '4. čas', start: '16:05', end: '16:50' },
          { class: '5. čas', start: '16:55', end: '17:40' },
          { class: '6. čas', start: '17:45', end: '18:30' },
          { class: '7. čas', start: '18:35', end: '19:20' },
        ],
      };

      const scheduleRef = ref(database, 'schedule');
      await set(scheduleRef, defaultSchedule);
      setError(null);
    } catch (err) {
      console.error('Greška pri popunjavanju default rasporeda:', err);
      setError('Greška pri popunjavanju default rasporeda');
      throw err;
    }
  }, []);

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
    populateDefaultSchedule,
    clearError,
  };
}
