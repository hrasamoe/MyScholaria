/**
 * Academic year / tuition schedule configuration.
 *
 * Start/end month now come from the establishment's settings
 * (see hooks/useAcademicYear.ts), fetched from
 * GET /api/establishment/academic-year. The constants below are only
 * fallback defaults, used before the settings have loaded or if the
 * API call fails.
 */

export const DEFAULT_ACADEMIC_YEAR_START_MONTH = 9;
export const DEFAULT_ACADEMIC_YEAR_END_MONTH = 6;

/**
 * Number of monthly installments in a cycle running from startMonth
 * to endMonth (inclusive), wrapping across the calendar-year boundary
 * if endMonth < startMonth (e.g. Sept -> June = 10 months).
 */
export const getAcademicYearLength = (
  startMonth: number,
  endMonth: number,
): number => {
  return ((endMonth - startMonth + 12) % 12) + 1;
};

/**
 * Ordered month labels for one academic cycle, e.g.
 * ["September", "October", ..., "June"] for the defaults above.
 */
export const getAcademicMonthLabels = (
  startMonth: number = DEFAULT_ACADEMIC_YEAR_START_MONTH,
  endMonth: number = DEFAULT_ACADEMIC_YEAR_END_MONTH,
): string[] => {
  const length = getAcademicYearLength(startMonth, endMonth);
  const labels: string[] = [];
  for (let i = 0; i < length; i++) {
    const monthIndex = (startMonth - 1 + i) % 12;
    labels.push(
      new Date(2000, monthIndex, 1).toLocaleString("en-US", {
        month: "long",
      }),
    );
  }
  return labels;
};

// Maps each label to its 0-based offset within the cycle (0 = first month).
const buildMonthOffset = (
  startMonth: number,
  endMonth: number,
): Record<string, number> =>
  getAcademicMonthLabels(startMonth, endMonth).reduce(
    (acc, label, i) => {
      acc[label] = i;
      return acc;
    },
    {} as Record<string, number>,
  );

/**
 * The academic cycle can straddle a calendar-year boundary (e.g.
 * Sept -> June crosses into the next year). Since tuition months only
 * store a label (no year), we infer which calendar year the *current*
 * cycle started in from today's date.
 */
export const getAcademicStartYear = (
  startMonth: number = DEFAULT_ACADEMIC_YEAR_START_MONTH,
): number => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  return currentMonth >= startMonth ? now.getFullYear() : now.getFullYear() - 1;
};

/**
 * Tuition due date rule: the day before the last day of the month.
 * Works for any start/end month, including cycles that wrap across
 * a calendar-year boundary.
 */
export const getTuitionDueDate = (
  monthLabel: string,
  startMonth: number = DEFAULT_ACADEMIC_YEAR_START_MONTH,
  endMonth: number = DEFAULT_ACADEMIC_YEAR_END_MONTH,
): Date => {
  const startYear = getAcademicStartYear(startMonth);
  const offset = buildMonthOffset(startMonth, endMonth)[monthLabel] ?? 0;
  const totalMonthsFromJan = startMonth - 1 + offset;
  const calendarYear = startYear + Math.floor(totalMonthsFromJan / 12);
  const calendarMonthIndex = totalMonthsFromJan % 12; // 0-11

  // Day 0 of "next month" = last day of target month.
  const lastDayOfMonth = new Date(calendarYear, calendarMonthIndex + 1, 0);
  const dueDate = new Date(lastDayOfMonth);
  dueDate.setDate(lastDayOfMonth.getDate() - 1);
  return dueDate;
};
