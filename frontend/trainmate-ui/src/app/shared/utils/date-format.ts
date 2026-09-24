export const DATE_FORMATS = {
  // Display formats
  DISPLAY_DATE: 'dd-MMM-yyyy',        // 01-Sep-2026
  DISPLAY_DATE_SHORT: 'dd/MM/yyyy',   // 01/09/2026
  DISPLAY_DATE_ISO: 'yyyy-MM-dd',     // 2026-09-01
  DISPLAY_DATETIME: 'dd-MMM-yyyy HH:mm', // 01-Sep-2026 14:30
  DISPLAY_DATETIME_FULL: 'medium',    // Sep 1, 2026, 2:30:00 PM
  
  // Input formats (for parsing)
  INPUT_FORMATS: [
    'dd-MMM-yyyy',
    'dd-MM-yyyy',
    'yyyy-MM-dd',
    'd-MMM-yyyy',
    'dd/MM/yyyy',
    'yyyy/MM/dd'
  ] as const
} as const;

export type DateFormatType = typeof DATE_FORMATS.DISPLAY_DATE | typeof DATE_FORMATS.DISPLAY_DATE_SHORT | typeof DATE_FORMATS.DISPLAY_DATE_ISO;

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  for (const format of DATE_FORMATS.INPUT_FORMATS) {
    try {
      return parseDateWithFormat(dateStr, format);
    } catch {
      // Continue to next format
    }
  }
  return null;
}

function parseDateWithFormat(dateStr: string, format: string): Date {
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) throw new Error('Invalid date format');
  
  let day: number, month: number, year: number;
  
  if (format.startsWith('yyyy')) {
    // yyyy-MM-dd or yyyy/MM/dd
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    day = parseInt(parts[2], 10);
  } else if (format.includes('MMM')) {
    // dd-MMM-yyyy or d-MMM-yyyy
    day = parseInt(parts[0], 10);
    month = parseMonth(parts[1]);
    year = parseInt(parts[2], 10);
  } else {
    // dd-MM-yyyy or dd/MM/yyyy
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10) - 1;
    year = parseInt(parts[2], 10);
  }
  
  const date = new Date(year, month, day);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    throw new Error('Invalid date');
  }
  return date;
}

function parseMonth(monthStr: string): number {
  const months: Record<string, number> = {
    'jan': 0, 'january': 0,
    'feb': 1, 'february': 1,
    'mar': 2, 'march': 2,
    'apr': 3, 'april': 3,
    'may': 4,
    'jun': 5, 'june': 5,
    'jul': 6, 'july': 6,
    'aug': 7, 'august': 7,
    'sep': 8, 'september': 8,
    'oct': 9, 'october': 9,
    'nov': 10, 'november': 10,
    'dec': 11, 'december': 11
  };
  const normalized = monthStr.toLowerCase().slice(0, 3);
  const month = months[normalized];
  if (month === undefined) throw new Error('Invalid month');
  return month;
}

export function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // ISO format for <input type="date">
}

export function formatDateForDisplay(date: Date | string | null, format: DateFormatType = DATE_FORMATS.DISPLAY_DATE): string {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  
  if (format === DATE_FORMATS.DISPLAY_DATE_ISO) {
    return `${year}-${String(month).padStart(2, '0')}-${day}`;
  }
  
  if (format === DATE_FORMATS.DISPLAY_DATE_SHORT) {
    return `${day}/${String(month).padStart(2, '0')}/${year}`;
  }
  
  // DISPLAY_DATE: dd-MMM-yyyy
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${monthNames[month - 1]}-${year}`;
}