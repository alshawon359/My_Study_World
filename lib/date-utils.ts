/**
 * Date utilities that handle Bangladesh timezone properly
 * BD timezone: Asia/Dhaka (UTC+6)
 */

/**
 * Get current date in Bangladesh timezone
 */
export function getBDDate(): Date {
  // Use toLocaleString to get BD time properly
  const bdTimeString = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
  });
  return new Date(bdTimeString);
}

/**
 * Get current day of week in BD timezone (0 = Sunday, 6 = Saturday)
 */
export function getBDDayOfWeek(): number {
  return getBDDate().getDay();
}

/**
 * Get current date string in BD timezone (YYYY-MM-DD)
 */
export function getBDDateString(): string {
  const bdDate = getBDDate();
  return bdDate.toISOString().split('T')[0];
}

/**
 * Get current time string in BD timezone (HH:MM)
 */
export function getBDTimeString(): string {
  const bdDate = getBDDate();
  const hours = bdDate.getHours().toString().padStart(2, '0');
  const minutes = bdDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert date string to start of day in BD timezone
 */
export function getBDStartOfDay(dateStr: string): Date {
  // Parse as UTC midnight, then adjust to BD timezone
  return new Date(dateStr + 'T00:00:00.000+06:00');
}

/**
 * Convert date string to end of day in BD timezone
 */
export function getBDEndOfDay(dateStr: string): Date {
  return new Date(dateStr + 'T23:59:59.999+06:00');
}

/**
 * Get day name in Bengali/English
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}
