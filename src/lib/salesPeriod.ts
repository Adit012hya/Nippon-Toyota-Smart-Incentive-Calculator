export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MIN_SALES_YEAR = 2000;

export function getCurrentPeriod() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/** Years from current year down to MIN_SALES_YEAR (newest first). */
export function getAvailableYears(minYear = MIN_SALES_YEAR): number[] {
  const { year: currentYear } = getCurrentPeriod();
  const years: number[] = [];
  for (let y = currentYear; y >= minYear; y--) years.push(y);
  return years;
}

/** Months allowed for a given year — no future months in the current year. */
export function getAvailableMonths(selectedYear: number): { value: number; label: string }[] {
  const { year: currentYear, month: currentMonth } = getCurrentPeriod();
  const maxMonth = selectedYear === currentYear ? currentMonth : 12;
  return MONTHS.slice(0, maxMonth).map((label, i) => ({
    value: i + 1,
    label,
  }));
}

export function clampMonthForYear(month: number, selectedYear: number): number {
  const available = getAvailableMonths(selectedYear);
  const maxMonth = available[available.length - 1]?.value ?? 1;
  return Math.min(Math.max(1, month), maxMonth);
}

export function formatPeriod(month: number, year: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}
