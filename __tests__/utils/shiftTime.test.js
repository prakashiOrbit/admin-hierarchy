import { formatTime, extractTime, buildDateTime } from '../../src/utils/shiftTime';

// ─── formatTime ────────────────────────────────────────────────────────────────

describe('formatTime', () => {
  describe('null / empty inputs', () => {
    it('returns — for null', () => expect(formatTime(null)).toBe('—'));
    it('returns — for undefined', () => expect(formatTime(undefined)).toBe('—'));
    it('returns — for empty string', () => expect(formatTime('')).toBe('—'));
  });

  describe('Jackson array format [year, month, day, hour, minute]', () => {
    it('formats morning time', () => expect(formatTime([2026, 5, 29, 8, 0])).toBe('8:00 AM'));
    it('formats afternoon time', () => expect(formatTime([2026, 5, 29, 16, 30])).toBe('4:30 PM'));
    it('formats midnight (0:00)', () => expect(formatTime([2026, 5, 29, 0, 0])).toBe('12:00 AM'));
    it('formats noon (12:00)', () => expect(formatTime([2026, 5, 29, 12, 0])).toBe('12:00 PM'));
    it('formats 11:59 PM', () => expect(formatTime([2026, 5, 29, 23, 59])).toBe('11:59 PM'));
    it('pads single-digit minutes', () => expect(formatTime([2026, 5, 29, 9, 5])).toBe('9:05 AM'));
    it('handles missing second element gracefully', () => {
      expect(formatTime([2026, 5, 29, 14])).toBe('2:00 PM');
    });
  });

  describe('ISO string format "YYYY-MM-DDTHH:MM:SS"', () => {
    it('formats morning ISO string', () => expect(formatTime('2026-05-29T08:00:00')).toBe('8:00 AM'));
    it('formats afternoon ISO string', () => expect(formatTime('2026-05-29T16:30:00')).toBe('4:30 PM'));
    it('formats noon ISO string', () => expect(formatTime('2026-05-29T12:00:00')).toBe('12:00 PM'));
    it('formats midnight ISO string', () => expect(formatTime('2026-05-29T00:00:00')).toBe('12:00 AM'));
    it('formats ISO string with milliseconds', () => {
      expect(formatTime('2026-05-29T08:30:00.000')).toBe('8:30 AM');
    });
  });

  describe('edge cases', () => {
    it('returns the raw value for completely unparseable input', () => {
      expect(formatTime('not-a-date')).toBe('not-a-date');
    });
  });
});

// ─── extractTime ───────────────────────────────────────────────────────────────

describe('extractTime', () => {
  describe('null / empty inputs', () => {
    it('returns empty string for null', () => expect(extractTime(null)).toBe(''));
    it('returns empty string for undefined', () => expect(extractTime(undefined)).toBe(''));
  });

  describe('Jackson array format', () => {
    it('extracts HH:MM from array', () => expect(extractTime([2026, 5, 29, 8, 0])).toBe('08:00'));
    it('pads hour and minute with leading zero', () => {
      expect(extractTime([2026, 5, 29, 9, 5])).toBe('09:05');
    });
    it('extracts afternoon time', () => expect(extractTime([2026, 5, 29, 16, 30])).toBe('16:30'));
    it('extracts midnight', () => expect(extractTime([2026, 5, 29, 0, 0])).toBe('00:00'));
  });

  describe('ISO string format', () => {
    it('extracts time from ISO string', () => {
      expect(extractTime('2026-05-29T08:00:00')).toBe('08:00');
    });
    it('extracts afternoon time from ISO string', () => {
      expect(extractTime('2026-05-29T16:30:00')).toBe('16:30');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for unparseable input', () => {
      expect(extractTime('not-a-date')).toBe('');
    });
  });
});

// ─── buildDateTime ─────────────────────────────────────────────────────────────

describe('buildDateTime', () => {
  // Use a fixed date so tests are deterministic
  const fixedDate = new Date('2026-05-29T00:00:00.000Z');

  it('combines a date and time string into ISO format', () => {
    expect(buildDateTime('08:00', fixedDate)).toBe('2026-05-29T08:00:00');
  });

  it('works for afternoon times', () => {
    expect(buildDateTime('16:30', fixedDate)).toBe('2026-05-29T16:30:00');
  });

  it('falls back to 00:00 when timeStr is empty', () => {
    expect(buildDateTime('', fixedDate)).toBe('2026-05-29T00:00:00');
  });

  it('falls back to 00:00 when timeStr is null', () => {
    expect(buildDateTime(null, fixedDate)).toBe('2026-05-29T00:00:00');
  });

  it('produces a string the backend can deserialise as LocalDateTime', () => {
    const result = buildDateTime('08:00', fixedDate);
    // Must match ISO-8601 local datetime pattern
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00$/);
  });
});
