import { getDateRange, getDateString } from './date';

describe('getDateRange', () => {
  it('returns the full month range for month view', () => {
    const dates = getDateRange('2026-04-20', 'month');

    expect(getDateString(dates[0])).toBe('2026-04-01');
    expect(getDateString(dates[dates.length - 1])).toBe('2026-04-30');
    expect(dates).toHaveLength(30);
  });
});
