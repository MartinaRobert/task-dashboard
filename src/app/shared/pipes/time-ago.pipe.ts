import { Pipe, PipeTransform } from '@angular/core';

const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'day', seconds: 86_400 },
  { unit: 'hour', seconds: 3_600 },
  { unit: 'minute', seconds: 60 },
];

/**
 * Shows a date as relative time, e.g. "2 days ago" or "منذ يومين".
 * The language is passed in, so the pipe updates when the language changes.
 * Usage: {{ activity.date | timeAgo: language.current() }}
 */
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(date: string, lang = 'en', now = new Date()): string {
    const formatter = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
    const diffSeconds = Math.round((new Date(date).getTime() - now.getTime()) / 1000);

    for (const { unit, seconds } of UNITS) {
      if (Math.abs(diffSeconds) >= seconds) {
        return formatter.format(Math.round(diffSeconds / seconds), unit);
      }
    }
    return formatter.format(0, 'second');
  }
}
