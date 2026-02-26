import {
  formatDate,
  formatCurrency,
  addDays,
  addMinutes,
  isExpired,
  getDateRange
} from '../../../utils/dateUtils.js';

describe('Date Utils Unit Tests', () => {
  describe('formatDate', () => {
    it('should format date to readable string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });

    it('should handle different date inputs', () => {
      const testDates = [
        new Date(),
        new Date('2024-01-01'),
        new Date('2023-12-31T23:59:59'),
        new Date(Date.now())
      ];

      testDates.forEach(date => {
        const formatted = formatDate(date);
        expect(formatted).toBeTruthy();
      });
    });

    it('should handle string date input', () => {
      const dateString = '2024-01-15';
      const formatted = formatDate(dateString);

      expect(formatted).toBeTruthy();
    });

    it('should handle timestamp input', () => {
      const timestamp = Date.now();
      const formatted = formatDate(timestamp);

      expect(formatted).toBeTruthy();
    });
  });

  describe('formatCurrency', () => {
    it('should format numbers as currency', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(99.99)).toBe('$99.99');
      expect(formatCurrency(1000.50)).toBe('$1,000.50');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(0.00)).toBe('$0.00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(999999.99)).toBe('$999,999.99');
    });

    it('should handle decimal numbers', () => {
      expect(formatCurrency(10.5)).toBe('$10.50');
      expect(formatCurrency(10.1)).toBe('$10.10');
      expect(formatCurrency(10.01)).toBe('$10.01');
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('100')).toBe('$100.00');
      expect(formatCurrency('99.99')).toBe('$99.99');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
      expect(formatCurrency(-99.99)).toBe('-$99.99');
    });
  });

  describe('addDays', () => {
    it('should add days to a date', () => {
      const date = new Date('2024-01-15');
      const newDate = addDays(date, 5);

      expect(newDate.getDate()).toBe(date.getDate() + 5);
    });

    it('should subtract days with negative number', () => {
      const date = new Date('2024-01-15');
      const newDate = addDays(date, -5);

      expect(newDate.getDate()).toBe(date.getDate() - 5);
    });

    it('should handle zero days', () => {
      const date = new Date('2024-01-15');
      const newDate = addDays(date, 0);

      expect(newDate.getTime()).toBe(date.getTime());
    });

    it('should handle month boundaries', () => {
      const date = new Date('2024-01-30');
      const newDate = addDays(date, 5);

      expect(newDate.getMonth()).toBe(1);
      expect(newDate.getDate()).toBe(4);
    });

    it('should handle year boundaries', () => {
      const date = new Date('2024-12-30');
      const newDate = addDays(date, 5);

      expect(newDate.getFullYear()).toBe(2025);
      expect(newDate.getMonth()).toBe(0);
      expect(newDate.getDate()).toBe(4);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15');
      const originalTime = date.getTime();
      addDays(date, 5);

      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('addMinutes', () => {
    it('should add minutes to a date', () => {
      const date = new Date('2024-01-15T10:00:00');
      const newDate = addMinutes(date, 30);

      expect(newDate.getMinutes()).toBe(30);
    });

    it('should handle hour boundaries', () => {
      const date = new Date('2024-01-15T10:45:00');
      const newDate = addMinutes(date, 30);

      expect(newDate.getHours()).toBe(11);
      expect(newDate.getMinutes()).toBe(15);
    });

    it('should subtract minutes with negative number', () => {
      const date = new Date('2024-01-15T10:30:00');
      const newDate = addMinutes(date, -15);

      expect(newDate.getMinutes()).toBe(15);
    });

    it('should handle day boundaries', () => {
      const date = new Date('2024-01-15T23:50:00');
      const newDate = addMinutes(date, 20);

      expect(newDate.getDate()).toBe(16);
      expect(newDate.getHours()).toBe(0);
      expect(newDate.getMinutes()).toBe(10);
    });

    it('should not modify original date', () => {
      const date = new Date('2024-01-15T10:00:00');
      const originalTime = date.getTime();
      addMinutes(date, 30);

      expect(date.getTime()).toBe(originalTime);
    });
  });

  describe('isExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000);
      expect(isExpired(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 10000);
      expect(isExpired(futureDate)).toBe(false);
    });

    it('should handle null dates', () => {
      expect(isExpired(null)).toBe(true);
    });

    it('should handle undefined dates', () => {
      expect(isExpired(undefined)).toBe(true);
    });

    it('should handle dates far in the past', () => {
      const oldDate = new Date('2020-01-01');
      expect(isExpired(oldDate)).toBe(true);
    });

    it('should handle dates far in the future', () => {
      const futureDate = new Date('2030-01-01');
      expect(isExpired(futureDate)).toBe(false);
    });
  });

  describe('getDateRange', () => {
    it('should generate date range for last 7 days', () => {
      const range = getDateRange('7days');

      expect(range).toHaveProperty('from');
      expect(range).toHaveProperty('to');
      expect(range.from).toBeInstanceOf(Date);
      expect(range.to).toBeInstanceOf(Date);
    });

    it('should generate date range for last 30 days', () => {
      const range = getDateRange('30days');
      const daysDiff = Math.ceil((range.to - range.from) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(30);
    });

    it('should generate date range for this month', () => {
      const range = getDateRange('thisMonth');
      const now = new Date();

      expect(range.from.getMonth()).toBe(now.getMonth());
      expect(range.from.getDate()).toBe(1);
    });

    it('should generate date range for this year', () => {
      const range = getDateRange('thisYear');
      const now = new Date();

      expect(range.from.getFullYear()).toBe(now.getFullYear());
      expect(range.from.getMonth()).toBe(0);
      expect(range.from.getDate()).toBe(1);
    });

    it('should handle custom date range', () => {
      const from = new Date('2024-01-01');
      const to = new Date('2024-12-31');
      const range = getDateRange('custom', from, to);

      expect(range.from.getTime()).toBe(from.getTime());
      expect(range.to.getTime()).toBe(to.getTime());
    });
  });

  describe('Date manipulation edge cases', () => {
    it('should handle leap years', () => {
      const leapYear = new Date('2024-02-29');
      const nextDay = addDays(leapYear, 1);

      expect(nextDay.getMonth()).toBe(2);
      expect(nextDay.getDate()).toBe(1);
    });

    it('should handle daylight saving time', () => {
      const beforeDST = new Date('2024-03-10T01:00:00');
      const after24Hours = addDays(beforeDST, 1);

      const hoursDiff = (after24Hours - beforeDST) / (1000 * 60 * 60);
      expect(Math.abs(hoursDiff - 24)).toBeLessThan(2);
    });

    it('should handle timezone conversions', () => {
      const date = new Date();
      const formatted = formatDate(date);

      expect(formatted).toBeTruthy();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Currency formatting edge cases', () => {
    it('should handle very small amounts', () => {
      expect(formatCurrency(0.01)).toBe('$0.01');
      expect(formatCurrency(0.10)).toBe('$0.10');
    });

    it('should handle millions', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(5500000.50)).toBe('$5,500,000.50');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(10.125)).toBe('$10.13');
      expect(formatCurrency(10.124)).toBe('$10.12');
    });
  });
});
