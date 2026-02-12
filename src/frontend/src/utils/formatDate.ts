import { format } from 'date-fns';

/**
 * Formats a backend Time (bigint nanoseconds) into a readable date string
 * @param time - Time in nanoseconds (bigint)
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatJoinedDate(time: bigint): string {
  // Convert nanoseconds to milliseconds
  const milliseconds = Number(time) / 1000000;
  const date = new Date(milliseconds);
  return format(date, 'MMMM d, yyyy');
}
