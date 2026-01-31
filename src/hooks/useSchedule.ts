import { useState, useEffect } from 'react';
import { database } from '../firebase-config';
import { ref, onValue } from 'firebase/database';

export interface ClassPeriod {
  class: string;
  start: string;
  end: string;
}

export interface Schedule {
  firstShift: ClassPeriod[];
  secondShift: ClassPeriod[];
}

export interface CurrentClass {
  className: string;
  startTime: Date;
  endTime: Date;
  isBreak?: boolean;
  isLastClass?: boolean;
  currentIndex?: number;
  totalClasses?: number;
}

export interface UseScheduleReturn {
  schedule: Schedule | null;
  currentClass: CurrentClass | null;
  nextClass: ClassPeriod | null;
  shift: string;
  isLoading: boolean;
  remainingTime: string;
  dataSource: 'firebase' | 'local' | null;
}

export const useSchedule = (externalTime?: Date): UseScheduleReturn => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [currentClass, setCurrentClass] = useState<CurrentClass | null>(null);
  const [nextClass, setNextClass] = useState<ClassPeriod | null>(null);
  const [shift, setShift] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [dataSource, setDataSource] = useState<'firebase' | 'local' | null>(null);

  // Učitaj raspored - Firebase primarno, lokalni kao backup
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let firebaseTimeout: NodeJS.Timeout;

    const initSchedule = async () => {
      try {
        if (database) {
          // Postavi timeout za Firebase - ako ne odgovori za 3 sekunde, koristi lokalni
          firebaseTimeout = setTimeout(() => {
            console.log('Firebase timeout - učitavam lokalni raspored...');
            loadLocalSchedule().then((success) => {
              if (success) setDataSource('local');
              setIsLoading(false);
            });
          }, 3000);

          const scheduleRef = ref(database, 'schedule');

          unsubscribe = onValue(scheduleRef,
            (snapshot) => {
              clearTimeout(firebaseTimeout);
              const data = snapshot.val();

              if (data && data.firstShift && data.secondShift) {
                setSchedule(data);
                setDataSource('firebase');
                console.log('✅ Raspored učitan iz Firebase');
                setIsLoading(false);
              } else {
                console.log('Firebase nema podatke - učitavam lokalni raspored...');
                loadLocalSchedule().then((success) => {
                  if (success) setDataSource('local');
                  setIsLoading(false);
                });
              }
            },
            (error) => {
              clearTimeout(firebaseTimeout);
              console.warn('Firebase greška - prebacujem na lokalni raspored:', error.message);
              loadLocalSchedule().then((success) => {
                if (success) setDataSource('local');
                setIsLoading(false);
              });
            }
          );
        } else {
          // Ako Firebase nije inicijalizovan, koristi lokalni
          await loadLocalSchedule();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Greška pri inicijalizaciji:', error);
        await loadLocalSchedule();
        setIsLoading(false);
      }
    };

    initSchedule();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (firebaseTimeout) {
        clearTimeout(firebaseTimeout);
      }
    };
  }, []);

  // Fallback na lokalni raspored
  const loadLocalSchedule = async () => {
    try {
      const response = await fetch('/schedule.json');
      const data = await response.json();

      if (data && data.firstShift && data.secondShift) {
        setSchedule(data);
        console.log('📁 Učitan lokalni raspored (fallback)');
        return true;
      }

      console.error('❌ Lokalni raspored nije valjan');
      return false;
    } catch (error) {
      console.error('❌ Greška pri učitavanju lokalnog rasporeda:', error);
      return false;
    }
  };

  // Parse time string to Date
  const parseTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );
  };

  // Calculate current class and shift
  useEffect(() => {
    if (!schedule) return;

    const updateClassInfo = () => {
      const currentTime = externalTime || new Date();

      // Check first shift
      const firstShiftStart = parseTime(schedule.firstShift[0].start);
      const firstShiftEnd = parseTime(schedule.firstShift[schedule.firstShift.length - 1].end);

      // Check second shift
      const secondShiftStart = parseTime(schedule.secondShift[0].start);
      const secondShiftEnd = parseTime(schedule.secondShift[schedule.secondShift.length - 1].end);

      let currentShift = '';
      let shiftData: ClassPeriod[] = [];

      if (currentTime >= firstShiftStart && currentTime <= firstShiftEnd) {
        currentShift = 'Prva smena';
        shiftData = schedule.firstShift;
      } else if (currentTime >= secondShiftStart && currentTime <= secondShiftEnd) {
        currentShift = 'Druga smena';
        shiftData = schedule.secondShift;
      }

      // Find current class
      let foundClass: CurrentClass | null = null;
      let foundNext: ClassPeriod | null = null;

      // Prebrojimo koliko ima stvarnih časova (bez odmora)
      const actualClasses = shiftData.filter(p => !p.class.toLowerCase().includes('odmor'));
      let classCounter = 0;

      for (let i = 0; i < shiftData.length; i++) {
        const period = shiftData[i];
        const startTime = parseTime(period.start);
        const endTime = parseTime(period.end);
        const isBreakByName = period.class.toLowerCase().includes('odmor');

        // Uvećaj brojač samo ako nije odmor
        if (!isBreakByName) {
          classCounter++;
        }

        if (currentTime >= startTime && currentTime <= endTime) {
          foundClass = {
            className: period.class,
            startTime,
            endTime,
            isBreak: isBreakByName,
            isLastClass: i === shiftData.length - 1,
            currentIndex: isBreakByName ? undefined : classCounter,
            totalClasses: actualClasses.length,
          };

          if (i < shiftData.length - 1) {
            foundNext = shiftData[i + 1];
          }
          break;
        }

        // Check if in break between classes
        if (i < shiftData.length - 1) {
          const nextPeriod = shiftData[i + 1];
          const breakStart = parseTime(period.end);
          const breakEnd = parseTime(nextPeriod.start);

          if (currentTime > breakStart && currentTime < breakEnd) {
            const breakDuration = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
            const breakName = breakDuration > 5 ? 'VELIKI ODMOR' : 'MALI ODMOR';

            foundClass = {
              className: breakName,
              startTime: breakStart,
              endTime: breakEnd,
              isBreak: true,
              currentIndex: i + 1,
            };
            foundNext = nextPeriod;
            break;
          }
        }
      }

      // Fallback: If within shift hours but no class found
      if (!foundClass && currentShift) {
        // Find next upcoming class
        for (let i = 0; i < shiftData.length; i++) {
          const period = shiftData[i];
          const startTime = parseTime(period.start);
          if (currentTime < startTime) {
            const prevPeriod = i > 0 ? shiftData[i - 1] : null;
            const breakStart = prevPeriod ? parseTime(prevPeriod.end) : currentTime;
            const breakDuration = (startTime.getTime() - breakStart.getTime()) / (1000 * 60);

            foundClass = {
              className: breakDuration > 5 ? 'VELIKI ODMOR' : 'MALI ODMOR',
              startTime: breakStart,
              endTime: startTime,
              isBreak: true,
            };
            foundNext = period;
            break;
          }
        }

        // If still no class (after last period), show "Van školskog vremena"
        if (!foundClass) {
          currentShift = '';
        }
      }

      setShift(currentShift);
      setCurrentClass(foundClass);
      setNextClass(foundNext);

      // Calculate remaining time
      if (foundClass) {
        const timeDiff = foundClass.endTime.getTime() - currentTime.getTime();
        if (timeDiff > 0) {
          const minutes = Math.floor((timeDiff / 1000 / 60) % 60);
          const seconds = Math.floor((timeDiff / 1000) % 60);
          setRemainingTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        } else {
          setRemainingTime('00:00');
        }
      } else {
        setRemainingTime('');
      }
    };

    const interval = setInterval(updateClassInfo, 1000);
    updateClassInfo();

    return () => clearInterval(interval);
  }, [schedule, externalTime]);

  return {
    schedule,
    currentClass,
    nextClass,
    shift,
    isLoading,
    remainingTime,
    dataSource,
  };
};