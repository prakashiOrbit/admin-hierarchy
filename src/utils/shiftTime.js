/**
 * Formats a LocalDateTime value from the backend into a human-readable time string.
 * Handles two formats the backend may send:
 *   - Array: [year, month, day, hour, minute, second?] (Jackson default with timestamps enabled)
 *   - String: "2026-05-29T08:00:00" (Jackson ISO-8601 with timestamps disabled)
 *
 * @param {Array|string|null} dt
 * @returns {string} e.g. "8:00 AM" | "4:30 PM" | "—"
 */
export const formatTime = (dt) => {
  if (!dt) return '—';
  if (Array.isArray(dt)) {
    // Jackson LocalDateTime array: [year, month, day, hour, minute, second?, nano?]
    const h = dt[3] ?? 0;
    const min = String(dt[4] ?? 0).padStart(2, '0');
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${min} ${period}`;
  }
  if (typeof dt === 'string') {
    const m = dt.match(/T(\d{2}):(\d{2})/);
    if (m) {
      const h = parseInt(m[1], 10);
      const period = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${m[2]} ${period}`;
    }
  }
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return String(dt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(dt);
  }
};

/**
 * Extracts "HH:MM" from a backend LocalDateTime value for use in edit form inputs.
 *
 * @param {Array|string|null} dt
 * @returns {string} e.g. "08:00" | "16:30" | ""
 */
export const extractTime = (dt) => {
  if (!dt) return '';
  if (Array.isArray(dt)) {
    const h = String(dt[3] ?? 0).padStart(2, '0');
    const min = String(dt[4] ?? 0).padStart(2, '0');
    return `${h}:${min}`;
  }
  if (typeof dt === 'string') {
    const m = dt.match(/T(\d{2}:\d{2})/);
    if (m) return m[1];
  }
  try {
    const d = new Date(dt);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
};

/**
 * Combines a "HH:MM" time string with a date into an ISO-8601 datetime string
 * suitable for sending to the backend.
 * Accepts an optional date parameter so callers can inject a fixed date in tests.
 *
 * @param {string} timeStr  e.g. "08:00"
 * @param {Date}   [date]   defaults to today
 * @returns {string} e.g. "2026-05-29T08:00:00"
 */
export const buildDateTime = (timeStr, date = new Date()) => {
  const dateStr = date.toISOString().split('T')[0];
  return `${dateStr}T${timeStr || '00:00'}:00`;
};
