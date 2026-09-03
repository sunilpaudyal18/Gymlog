import { Routine } from '../types';

/**
 * Standard Day of Week Indices (Standard JavaScript Date.getDay()):
 * 0 = Sunday
 * 1 = Monday
 * 2 = Tuesday
 * 3 = Wednesday
 * 4 = Thursday
 * 5 = Friday
 * 6 = Saturday
 */

export const DAY_NAMES: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

/**
 * Default Recommended Weekly Split:
 * Monday: Chest + Triceps Focus
 * Tuesday: Push Day Workout (Shoulders & Chest)
 * Wednesday: Pull Day Focus (Back + Biceps)
 * Thursday: Leg Destroyer (Quads, Glutes & Calves)
 * Friday: Chest + Triceps Focus (or Arms & Hypertrophy)
 * Saturday: null (Active Recovery & Mobility)
 * Sunday: null (Full Rest & Recovery)
 */
export const DEFAULT_WEEKLY_SCHEDULE: Record<number, string | null> = {
  1: 'chest-triceps-focus',
  2: 'push-day-workout',
  3: 'pull-day-focus',
  4: 'leg-destroyer',
  5: 'chest-triceps-focus',
  6: null, // Active Recovery
  0: null, // Rest Day
};

export const REST_DAY_INFO: Record<number, { title: string; subtitle: string; tag: string }> = {
  6: {
    title: 'Active Recovery & Mobility',
    subtitle: 'Light stretching, joint mobility, and dynamic core activation.',
    tag: 'RECOVERY DAY',
  },
  0: {
    title: 'Full Rest & Muscle Repair',
    subtitle: 'Prioritize protein synthesis, hydration, and central nervous system recovery.',
    tag: 'REST DAY',
  },
};

/**
 * Returns the current day index (0 = Sun, 1 = Mon, ..., 6 = Sat) in client local time
 */
export function getCurrentDayIndex(): number {
  return new Date().getDay();
}

/**
 * Maps standard day index to Monday-first index:
 * Mon = 0, Tue = 1, Wed = 2, Thu = 3, Fri = 4, Sat = 5, Sun = 6
 */
export function getMondayFirstIndex(date: Date = new Date()): number {
  const day = date.getDay();
  return (day + 6) % 7;
}

/**
 * Timezone-safe check if two timestamps/dates represent the exact same calendar day
 */
export function isSameCalendarDay(d1: Date | number, d2: Date | number): boolean {
  const date1 = typeof d1 === 'number' ? new Date(d1) : d1;
  const date2 = typeof d2 === 'number' ? new Date(d2) : d2;

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export interface WeekDayNode {
  dayLabel: 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S';
  dayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
  mondayIndex: number; // 0..6 (Mon..Sun)
  date: Date;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

/**
 * Returns the 7 days of the current calendar week (starting Monday through Sunday)
 */
export function getCurrentWeekDays(now: Date = new Date()): WeekDayNode[] {
  const currentMondayIndex = getMondayFirstIndex(now);

  // Find Monday of the current week
  const monday = new Date(now);
  monday.setDate(now.getDate() - currentMondayIndex);
  monday.setHours(0, 0, 0, 0);

  const labels: ('M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S')[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return labels.map((dayLabel, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);

    const isToday = isSameCalendarDay(dayDate, now);
    const dayOfWeek = dayDate.getDay();

    const isPast = dayDate < now && !isToday;
    const isFuture = dayDate > now && !isToday;

    return {
      dayLabel,
      dayIndex: dayOfWeek,
      mondayIndex: idx,
      date: dayDate,
      dateStr: dayDate.toISOString().split('T')[0],
      isToday,
      isPast,
      isFuture,
    };
  });
}
