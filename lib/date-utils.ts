/**
 * Date utilities that handle Bangladesh timezone properly
 * BD timezone: Asia/Dhaka (UTC+6)
 */

/**
 * Get current date in Bangladesh timezone
 * Manually calculates UTC+6 offset
 */
export function getBDDate(): Date {
  const now = new Date();
  // Get UTC time in milliseconds
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Add 6 hours for Bangladesh (UTC+6)
  const bdTime = new Date(utcTime + (6 * 60 * 60 * 1000));
  return bdTime;
}

/**
 * Get current day of week in BD timezone (0 = Sunday, 6 = Saturday)
 */
export function getBDDayOfWeek(): number {
  const bdDate = getBDDate();
  return bdDate.getUTCDay(); // Use UTC methods since we already adjusted the time
}

/**
 * Get current date string in BD timezone (YYYY-MM-DD)
 */
export function getBDDateString(): string {
  const bdDate = getBDDate();
  const year = bdDate.getUTCFullYear();
  const month = String(bdDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(bdDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current time string in BD timezone (HH:MM)
 */
export function getBDTimeString(): string {
  const bdDate = getBDDate();
  const hours = String(bdDate.getUTCHours()).padStart(2, '0');
  const minutes = String(bdDate.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Convert date string to start of day in BD timezone
 */
export function getBDStartOfDay(dateStr: string): Date {
  // Parse date string and create BD midnight
  const [year, month, day] = dateStr.split('-').map(Number);
  const bdMidnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  // Subtract 6 hours to get the actual UTC time that represents BD midnight
  return new Date(bdMidnight.getTime() - (6 * 60 * 60 * 1000));
}

/**
 * Convert date string to end of day in BD timezone
 */
export function getBDEndOfDay(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const bdEndOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  // Subtract 6 hours to get the actual UTC time that represents BD end of day
  return new Date(bdEndOfDay.getTime() - (6 * 60 * 60 * 1000));
}

/**
 * Get day name in Bengali/English
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}
