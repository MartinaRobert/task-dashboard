import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  const pipe = new TimeAgoPipe();
  const now = new Date('2026-11-16T12:00:00Z');
  const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

  it('shows days, hours, minutes and "now"', () => {
    expect(pipe.transform(ago(2 * 86_400), 'en', now)).toBe('2 days ago');
    expect(pipe.transform(ago(86_400), 'en', now)).toBe('yesterday');
    expect(pipe.transform(ago(3 * 3_600), 'en', now)).toBe('3 hours ago');
    expect(pipe.transform(ago(5 * 60), 'en', now)).toBe('5 minutes ago');
    expect(pipe.transform(ago(10), 'en', now)).toBe('now');
  });

  it('uses the given language', () => {
    expect(pipe.transform(ago(2 * 86_400), 'ar', now)).not.toContain('days');
  });
});
