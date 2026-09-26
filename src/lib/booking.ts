import { getCity } from '@/lib/data/cities';

/**
 * Hand-offs to live prices. Trips only store a month and a length, so we
 * suggest concrete dates and build search links travelers can open to see
 * today's real fares and rates. Formats verified 2026-09 (see
 * docs/DATA_SOURCES.md); no API keys involved.
 */

export type TripDates = { depart: Date; return: Date };

/**
 * Second Friday of the next occurrence of `month` (this year if it hasn't
 * passed, else next year), returning `nights` later. Weekends keep leave
 * requests down, and the second week dodges most month-start holidays.
 */
export function suggestedDates(month: number, nights: number, today = new Date()): TripDates {
  const thisYear = today.getFullYear();
  const pick = (year: number) => {
    const first = new Date(year, month - 1, 1);
    const toFriday = (5 - first.getDay() + 7) % 7;
    return new Date(year, month - 1, 1 + toFriday + 7);
  };
  let depart = pick(thisYear);
  if (depart <= today) depart = pick(thisYear + 1);
  const ret = new Date(depart);
  ret.setDate(ret.getDate() + nights);
  return { depart, return: ret };
}

/** Local calendar date as YYYY-MM-DD (not toISOString, which shifts to UTC). */
export function isoDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateRange({ depart, return: ret }: TripDates): string {
  const day = (d: Date) =>
    d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day(depart)} – ${day(ret)}`;
}

export type SearchLink = { label: string; url: string };

/** Return-flight searches for one traveler. Metro codes (LON, NYC) are fine on Kayak. */
export function flightLinks(originCode: string, destinationCode: string, dates: TripDates): SearchLink[] {
  const from = getCity(originCode);
  const to = getCity(destinationCode);
  const out = isoDate(dates.depart);
  const back = isoDate(dates.return);
  const query = `flights from ${from.name} to ${to.name} ${out} to ${back}`;
  return [
    { label: 'Kayak', url: `https://www.kayak.com/flights/${from.code}-${to.code}/${out}/${back}/` },
    { label: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
  ];
}

/** Hotel search sized for the group: everyone as adults, two to a room. */
export function hotelLink(cityCode: string, dates: TripDates, travelers: number): SearchLink {
  const city = getCity(cityCode);
  const params = new URLSearchParams({
    ss: `${city.name.replace(/ \(.*\)$/, '')}, ${city.country}`,
    checkin: isoDate(dates.depart),
    checkout: isoDate(dates.return),
    group_adults: String(travelers),
    group_children: '0',
    no_rooms: String(Math.max(1, Math.ceil(travelers / 2))),
  });
  return { label: 'Booking.com', url: `https://www.booking.com/searchresults.html?${params}` };
}
