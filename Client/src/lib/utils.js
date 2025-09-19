/**
 * Formats a given date into a readable 24-hour time string.
 *
 * @function formateMessageTime
 * @param {Date | string | number} date - The date to format. Accepts a Date object, ISO string, or timestamp.
 * @returns {string} Formatted time string in "HH:MM" (24-hour) format, based on the "en-IN" locale.
 *
 * @example
 * // Returns "14:30" for 2:30 PM
 * formateMessageTime('2024-06-10T14:30:00Z');
 *
 * @remarks
 * - Uses the "en-IN" locale for formatting.
 * - Ensures leading zeros for single-digit hours/minutes.
 * - Does not include AM/PM (24-hour format).
 */
export const formateMessageTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}