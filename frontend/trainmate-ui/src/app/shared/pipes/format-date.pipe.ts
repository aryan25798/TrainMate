import { Pipe, PipeTransform } from '@angular/core';
import { formatDate as angularFormatDate } from '@angular/common';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, format: string = 'mediumDate', locale: string = 'en-US'): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    return angularFormatDate(date, format, undefined, locale);
  }
}