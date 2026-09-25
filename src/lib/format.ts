export function money(usd: number): string {
  return `$${Math.round(usd).toLocaleString('en-US')}`;
}

/** Short money for tight spots (chart caps): $840, $1.2k, $12k. */
export function moneyCompact(usd: number): string {
  const v = Math.round(usd);
  if (v < 1000) return `$${v}`;
  const k = v / 1000;
  return `$${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}k`;
}

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? '';
}

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
