/**
 * City dataset used both as traveler origins and candidate destinations.
 *
 * Verified 2026-09-25 against published 2026 hotel rates, fare benchmarks
 * and climate normals — sources and method in docs/DATA_SOURCES.md.
 *
 * - hotelNight: annual average for a mid-range double room, USD, including
 *   the taxes and mandatory fees a guest actually pays (VAT, city tax,
 *   resort fees). Seasonal swings are applied on top via peak/low/swing.
 * - foodDay: meals + local transport + one paid sight, per person per day.
 * - hub: airport competitiveness (lower = cheaper fares on average).
 * - highC: average daily high in °C for January and July; other months are
 *   interpolated along the annual cycle.
 * - peak / low: months when hotels charge peak or low-season prices;
 *   swing is how hard they move (0.1 ≈ flat, 0.45 ≈ extreme).
 * - wet: months with a seasonal weather hazard worth warning about.
 */

export type Season = 'peak' | 'shoulder' | 'low';

export type City = {
  code: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
  hub: number;
  hotelNight: number;
  foodDay: number;
  vibes: string[];
  blurb: string;
  highC: [jan: number, jul: number];
  peak: number[];
  low: number[];
  swing: number;
  wet?: { months: number[]; label: string };
  /** Why the nightly rate looks high: taxes or fees already folded in. */
  feeNote?: string;
};

export const CITIES: City[] = [
  // ── Europe ────────────────────────────────────────────────────────────
  { code: 'LON', name: 'London', country: 'United Kingdom', flag: '🇬🇧', lat: 51.51, lon: -0.13, hub: 0.85, hotelNight: 240, foodDay: 90, vibes: ['museums', 'nightlife', 'food'], blurb: 'World-class museums (most of them free), pubs and theatre. Pricey beds, but cheap flights from everywhere.', highC: [8, 24], peak: [6, 7, 8, 12], low: [1, 2], swing: 0.25 },
  { code: 'PAR', name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.86, lon: 2.35, hub: 0.88, hotelNight: 215, foodDay: 90, vibes: ['romance', 'food', 'museums'], blurb: 'Cafés, galleries and grand boulevards; a classic that never needs justifying.', highC: [7, 25], peak: [5, 6, 7, 9, 10], low: [1, 2], swing: 0.25 },
  { code: 'BCN', name: 'Barcelona', country: 'Spain', flag: '🇪🇸', lat: 41.39, lon: 2.17, hub: 0.9, hotelNight: 170, foodDay: 70, vibes: ['beach', 'nightlife', 'food'], blurb: 'Gaudí, tapas and a city beach, the crowd-pleaser of European reunions. The city tax doubled in 2025.', highC: [14, 28], peak: [6, 7, 8, 9], low: [1, 2, 11, 12], swing: 0.3, feeNote: 'Includes Barcelona city tax' },
  { code: 'MAD', name: 'Madrid', country: 'Spain', flag: '🇪🇸', lat: 40.42, lon: -3.7, hub: 0.9, hotelNight: 150, foodDay: 60, vibes: ['nightlife', 'food', 'museums'], blurb: 'Late dinners, later nights and the Prado. Hotels get cheaper in August, when the locals flee the heat.', highC: [10, 33], peak: [4, 5, 9, 10], low: [1, 2, 7, 8], swing: 0.2 },
  { code: 'LIS', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', lat: 38.72, lon: -9.14, hub: 0.95, hotelNight: 150, foodDay: 60, vibes: ['food', 'views', 'beach'], blurb: 'Hills, pastéis and Atlantic light, still friendlier on the wallet than most capitals.', highC: [15, 28], peak: [6, 7, 8, 9], low: [1, 2, 11, 12], swing: 0.3 },
  { code: 'ROM', name: 'Rome', country: 'Italy', flag: '🇮🇹', lat: 41.9, lon: 12.5, hub: 0.92, hotelNight: 185, foodDay: 75, vibes: ['history', 'food', 'romance'], blurb: 'Two thousand years of showing off, plus carbonara.', highC: [12, 31], peak: [4, 5, 6, 9, 10], low: [1, 2, 11], swing: 0.25 },
  { code: 'BER', name: 'Berlin', country: 'Germany', flag: '🇩🇪', lat: 52.52, lon: 13.4, hub: 0.92, hotelNight: 135, foodDay: 65, vibes: ['nightlife', 'history', 'art'], blurb: 'Clubs that never close and history on every corner, still decent value.', highC: [3, 24], peak: [5, 6, 7, 8, 9], low: [1, 2], swing: 0.2 },
  { code: 'AMS', name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', lat: 52.37, lon: 4.9, hub: 0.88, hotelNight: 240, foodDay: 85, vibes: ['canals', 'museums', 'nightlife'], blurb: 'Compact, bikeable and easy to reach, but since 2026 it has the steepest hotel taxes in Europe.', highC: [6, 22], peak: [4, 5, 6, 7, 8], low: [1, 2, 11], swing: 0.25, feeNote: 'Includes 21% VAT and 12.5% city tax (2026)' },
  { code: 'PRG', name: 'Prague', country: 'Czechia', flag: '🇨🇿', lat: 50.08, lon: 14.44, hub: 1.0, hotelNight: 120, foodDay: 50, vibes: ['history', 'beer', 'views'], blurb: 'A fairy-tale old town, and Europe’s best beer for very little money.', highC: [2, 24], peak: [5, 6, 7, 8, 12], low: [1, 2, 3], swing: 0.25 },
  { code: 'BUD', name: 'Budapest', country: 'Hungary', flag: '🇭🇺', lat: 47.5, lon: 19.04, hub: 1.0, hotelNight: 110, foodDay: 45, vibes: ['baths', 'nightlife', 'history'], blurb: 'Thermal baths by day, ruin bars by night: a big weekend on a small bill.', highC: [3, 27], peak: [5, 6, 7, 8, 12], low: [1, 2, 3], swing: 0.25 },
  { code: 'KRK', name: 'Kraków', country: 'Poland', flag: '🇵🇱', lat: 50.06, lon: 19.94, hub: 1.05, hotelNight: 90, foodDay: 40, vibes: ['history', 'food', 'budget'], blurb: 'A gorgeous medieval square and one of the best-value weekends in Europe.', highC: [1, 24], peak: [5, 6, 7, 8, 12], low: [1, 2, 3], swing: 0.25 },
  { code: 'VIE', name: 'Vienna', country: 'Austria', flag: '🇦🇹', lat: 48.21, lon: 16.37, hub: 0.95, hotelNight: 160, foodDay: 70, vibes: ['music', 'cafes', 'museums'], blurb: 'Imperial palaces, concert halls and cake. Civilised to a fault.', highC: [3, 26], peak: [5, 6, 9, 12], low: [1, 2, 3], swing: 0.2 },
  { code: 'CPH', name: 'Copenhagen', country: 'Denmark', flag: '🇩🇰', lat: 55.68, lon: 12.57, hub: 0.92, hotelNight: 205, foodDay: 95, vibes: ['design', 'food', 'canals'], blurb: 'Hygge, harbour swims and new-Nordic food. Bring a healthy budget.', highC: [3, 21], peak: [6, 7, 8], low: [1, 2, 3, 11], swing: 0.25 },
  { code: 'DUB', name: 'Dublin', country: 'Ireland', flag: '🇮🇪', lat: 53.35, lon: -6.26, hub: 0.92, hotelNight: 205, foodDay: 80, vibes: ['pubs', 'music', 'history'], blurb: 'The craic is mighty and the transatlantic connections are better still. Beds are among Europe’s priciest.', highC: [8, 19], peak: [3, 6, 7, 8], low: [1, 2, 11], swing: 0.25 },
  { code: 'EDI', name: 'Edinburgh', country: 'United Kingdom', flag: '🇬🇧', lat: 55.95, lon: -3.19, hub: 1.0, hotelNight: 170, foodDay: 75, vibes: ['history', 'views', 'whisky'], blurb: 'A castle on a crag, closes and cosy pubs. Rooms roughly double during the August festivals.', highC: [7, 19], peak: [6, 7, 8, 12], low: [1, 2, 3, 11], swing: 0.4 },
  { code: 'ATH', name: 'Athens', country: 'Greece', flag: '🇬🇷', lat: 37.98, lon: 23.73, hub: 0.98, hotelNight: 125, foodDay: 55, vibes: ['history', 'food', 'sun'], blurb: 'The Acropolis plus souvlaki-fuelled nights, with the islands one ferry away.', highC: [13, 33], peak: [6, 7, 8, 9], low: [1, 2, 11, 12], swing: 0.3 },
  { code: 'IST', name: 'Istanbul', country: 'Türkiye', flag: '🇹🇷', lat: 41.01, lon: 28.98, hub: 0.85, hotelNight: 120, foodDay: 50, vibes: ['history', 'food', 'bazaars'], blurb: 'Two continents in one city: epic food and a mega-hub airport. No longer the bargain it was.', highC: [9, 28], peak: [4, 5, 6, 9, 10], low: [1, 2, 11, 12], swing: 0.25 },
  { code: 'REK', name: 'Reykjavík', country: 'Iceland', flag: '🇮🇸', lat: 64.15, lon: -21.94, hub: 1.05, hotelNight: 230, foodDay: 105, vibes: ['nature', 'hot springs', 'views'], blurb: 'Halfway between Europe and North America, with lava fields thrown in. Everything costs a lot.', highC: [2, 14], peak: [6, 7, 8], low: [1, 2, 3, 11], swing: 0.3 },
  { code: 'STO', name: 'Stockholm', country: 'Sweden', flag: '🇸🇪', lat: 59.33, lon: 18.07, hub: 0.95, hotelNight: 175, foodDay: 85, vibes: ['design', 'islands', 'museums'], blurb: 'An archipelago city of clean lines and long summer light.', highC: [0, 22], peak: [6, 7, 8], low: [1, 2, 3, 11], swing: 0.25 },
  { code: 'MIL', name: 'Milan', country: 'Italy', flag: '🇮🇹', lat: 45.46, lon: 9.19, hub: 0.9, hotelNight: 185, foodDay: 80, vibes: ['fashion', 'food', 'design'], blurb: 'Aperitivo culture, the Duomo and the lakes within day-trip reach. Fashion and design weeks spike prices.', highC: [6, 29], peak: [2, 4, 9, 10], low: [1, 8], swing: 0.3 },
  { code: 'PMI', name: 'Palma de Mallorca', country: 'Spain', flag: '🇪🇸', lat: 39.57, lon: 2.65, hub: 1.0, hotelNight: 165, foodDay: 65, vibes: ['beach', 'sun', 'food'], blurb: 'Proper beach weather and a surprisingly lovely old town. Very seasonal.', highC: [15, 30], peak: [6, 7, 8, 9], low: [11, 12, 1, 2], swing: 0.4 },

  // ── North America ────────────────────────────────────────────────────
  { code: 'NYC', name: 'New York', country: 'United States', flag: '🇺🇸', lat: 40.71, lon: -74.01, hub: 0.85, hotelNight: 360, foodDay: 115, vibes: ['nightlife', 'food', 'museums'], blurb: 'The city that never sleeps. Rooms cost half as much in January as in December.', highC: [4, 29], peak: [9, 10, 11, 12], low: [1, 2], swing: 0.45, feeNote: 'Includes NYC hotel taxes (~15%)' },
  { code: 'MIA', name: 'Miami', country: 'United States', flag: '🇺🇸', lat: 25.76, lon: -80.19, hub: 0.9, hotelNight: 245, foodDay: 95, vibes: ['beach', 'nightlife', 'sun'], blurb: 'Beach days, Cuban coffee and neon nights, and the Americas’ go-to for winter sun.', highC: [24, 32], peak: [12, 1, 2, 3, 4], low: [6, 7, 8, 9], swing: 0.35, wet: { months: [8, 9, 10], label: 'Hurricane season' } },
  { code: 'LAX', name: 'Los Angeles', country: 'United States', flag: '🇺🇸', lat: 34.05, lon: -118.24, hub: 0.85, hotelNight: 245, foodDay: 100, vibes: ['beach', 'food', 'sun'], blurb: 'Tacos, trails and Pacific sunsets, if the group can handle the sprawl.', highC: [20, 29], peak: [6, 7, 8], low: [1, 2, 11], swing: 0.15 },
  { code: 'SFO', name: 'San Francisco', country: 'United States', flag: '🇺🇸', lat: 37.77, lon: -122.42, hub: 0.88, hotelNight: 255, foodDay: 105, vibes: ['views', 'food', 'nature'], blurb: 'Fog, hills and phenomenal food, a bridge away from the redwoods. Summer is cool; September is warmest.', highC: [14, 21], peak: [6, 7, 8, 9, 10], low: [12, 1, 2], swing: 0.2 },
  { code: 'CHI', name: 'Chicago', country: 'United States', flag: '🇺🇸', lat: 41.88, lon: -87.63, hub: 0.88, hotelNight: 215, foodDay: 90, vibes: ['architecture', 'food', 'music'], blurb: 'Big-shouldered architecture, deep dish and blues bars on the lake. Brutal in January.', highC: [0, 29], peak: [6, 7, 8, 9], low: [1, 2, 3], swing: 0.35 },
  { code: 'AUS', name: 'Austin', country: 'United States', flag: '🇺🇸', lat: 30.27, lon: -97.74, hub: 0.95, hotelNight: 205, foodDay: 85, vibes: ['music', 'food', 'nightlife'], blurb: 'Live music every night and barbecue worth the queue. Rooms spike for SXSW in March and F1 in October.', highC: [17, 36], peak: [3, 10], low: [1, 7, 8], swing: 0.3 },
  { code: 'MSY', name: 'New Orleans', country: 'United States', flag: '🇺🇸', lat: 29.95, lon: -90.07, hub: 1.0, hotelNight: 195, foodDay: 85, vibes: ['music', 'food', 'nightlife'], blurb: 'Jazz, gumbo and go-cups: America’s best city for a group weekend. Mardi Gras and Jazz Fest fill every bed.', highC: [17, 33], peak: [2, 3, 4], low: [6, 7, 8, 9], swing: 0.35, wet: { months: [8, 9], label: 'Hurricane season' } },
  { code: 'LAS', name: 'Las Vegas', country: 'United States', flag: '🇺🇸', lat: 36.17, lon: -115.14, hub: 0.88, hotelNight: 185, foodDay: 95, vibes: ['nightlife', 'shows', 'desert'], blurb: 'Cheap flights and cheap-looking rooms. Budget for the nightly resort fee.', highC: [14, 40], peak: [3, 4, 5, 10, 11], low: [7, 8, 12], swing: 0.25, feeNote: 'Includes ~$50/night Strip resort fee' },
  { code: 'YTO', name: 'Toronto', country: 'Canada', flag: '🇨🇦', lat: 43.65, lon: -79.38, hub: 0.9, hotelNight: 205, foodDay: 85, vibes: ['food', 'multicultural', 'museums'], blurb: 'A world of food in one grid of streets, with Niagara Falls within a day trip.', highC: [-1, 27], peak: [6, 7, 8, 9], low: [1, 2, 3], swing: 0.3 },
  { code: 'YVR', name: 'Vancouver', country: 'Canada', flag: '🇨🇦', lat: 49.28, lon: -123.12, hub: 0.92, hotelNight: 225, foodDay: 90, vibes: ['nature', 'food', 'views'], blurb: 'Mountains meet ocean: sushi and seawall strolls between hikes.', highC: [7, 22], peak: [6, 7, 8, 9], low: [1, 2, 11], swing: 0.35 },
  { code: 'MEX', name: 'Mexico City', country: 'Mexico', flag: '🇲🇽', lat: 19.43, lon: -99.13, hub: 0.9, hotelNight: 120, foodDay: 45, vibes: ['food', 'art', 'history'], blurb: 'Tacos al pastor, Frida and endless museums at 2,240 metres. Afternoon storms in summer.', highC: [22, 23], peak: [3, 4, 11, 12], low: [6, 7, 8, 9], swing: 0.15, wet: { months: [6, 7, 8, 9], label: 'Rainy season' } },
  { code: 'CUN', name: 'Cancún', country: 'Mexico', flag: '🇲🇽', lat: 21.16, lon: -86.85, hub: 0.92, hotelNight: 175, foodDay: 65, vibes: ['beach', 'sun', 'nightlife'], blurb: 'Caribbean water, cenotes and all-inclusive ease for mixed budgets.', highC: [28, 32], peak: [12, 1, 2, 3, 4], low: [5, 6, 9, 10, 11], swing: 0.4, wet: { months: [8, 9, 10], label: 'Hurricane season' } },

  // ── South America ────────────────────────────────────────────────────
  { code: 'BOG', name: 'Bogotá', country: 'Colombia', flag: '🇨🇴', lat: 4.71, lon: -74.07, hub: 0.95, hotelNight: 90, foodDay: 40, vibes: ['food', 'art', 'mountains'], blurb: 'Street art, specialty coffee and green hills. At 2,640 metres it stays cool all year.', highC: [20, 19], peak: [12, 1], low: [4, 5], swing: 0.1, wet: { months: [4, 5, 10, 11], label: 'Rainy season' } },
  { code: 'MDE', name: 'Medellín', country: 'Colombia', flag: '🇨🇴', lat: 6.24, lon: -75.58, hub: 1.0, hotelNight: 85, foodDay: 40, vibes: ['spring weather', 'nightlife', 'views'], blurb: 'The city of eternal spring: cable cars, salsa and great value.', highC: [28, 28], peak: [12, 1, 8], low: [4, 5, 10], swing: 0.15, wet: { months: [4, 5, 10, 11], label: 'Rainy season' } },
  { code: 'BUE', name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lat: -34.6, lon: -58.38, hub: 0.95, hotelNight: 100, foodDay: 50, vibes: ['food', 'nightlife', 'tango'], blurb: 'Steak, malbec and dancing until sunrise. Seasons are reversed: July is winter and low season.', highC: [30, 15], peak: [10, 11, 12, 1, 2, 3], low: [6, 7, 8], swing: 0.3 },
  { code: 'RIO', name: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', lat: -22.91, lon: -43.17, hub: 0.95, hotelNight: 130, foodDay: 55, vibes: ['beach', 'views', 'nightlife'], blurb: 'Copacabana, Christ the Redeemer and caipirinhas at sunset. New Year and Carnival cost a fortune.', highC: [30, 25], peak: [12, 1, 2], low: [5, 6, 7, 8], swing: 0.4, wet: { months: [12, 1, 2, 3], label: 'Wet season' } },
  { code: 'LIM', name: 'Lima', country: 'Peru', flag: '🇵🇪', lat: -12.05, lon: -77.04, hub: 0.95, hotelNight: 95, foodDay: 45, vibes: ['food', 'coast', 'history'], blurb: 'One of the world’s great food cities, with cliffs over the Pacific. Grey skies from May to November.', highC: [26, 19], peak: [12, 1, 2, 3], low: [6, 7, 8], swing: 0.15 },

  // ── Middle East & Africa ─────────────────────────────────────────────
  { code: 'DXB', name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', lat: 25.2, lon: 55.27, hub: 0.82, hotelNight: 160, foodDay: 85, vibes: ['luxury', 'beach', 'shopping'], blurb: 'A mega-hub meeting point, most of the planet within one direct flight. Summer rates crash because it’s 40 °C.', highC: [24, 41], peak: [11, 12, 1, 2, 3], low: [6, 7, 8, 9], swing: 0.45 },
  { code: 'DOH', name: 'Doha', country: 'Qatar', flag: '🇶🇦', lat: 25.29, lon: 51.53, hub: 0.85, hotelNight: 150, foodDay: 75, vibes: ['museums', 'souqs', 'luxury'], blurb: 'Stopover city turned destination: souq, corniche and world-class museums.', highC: [22, 41], peak: [11, 12, 1, 2, 3], low: [6, 7, 8], swing: 0.4 },
  { code: 'RAK', name: 'Marrakesh', country: 'Morocco', flag: '🇲🇦', lat: 31.63, lon: -7.99, hub: 1.02, hotelNight: 95, foodDay: 40, vibes: ['souqs', 'food', 'desert'], blurb: 'Riads, mint tea and the Atlas mountains on the horizon. Best in spring and autumn.', highC: [19, 37], peak: [3, 4, 10, 11, 12], low: [7, 8], swing: 0.3 },
  { code: 'CPT', name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', lat: -33.92, lon: 18.42, hub: 1.0, hotelNight: 120, foodDay: 55, vibes: ['nature', 'wine', 'beach'], blurb: 'Table Mountain, winelands and penguins. Superb value once you land; winter is wet.', highC: [26, 18], peak: [12, 1, 2, 3], low: [6, 7, 8], swing: 0.4, wet: { months: [6, 7, 8], label: 'Winter rains' } },

  // ── Asia & Oceania ───────────────────────────────────────────────────
  { code: 'TYO', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.68, lon: 139.69, hub: 0.88, hotelNight: 180, foodDay: 65, vibes: ['food', 'nightlife', 'culture'], blurb: 'Ramen at 2am, temples at dawn. Hotel rates hit records in 2026; cherry-blossom weeks book out.', highC: [10, 30], peak: [3, 4, 10, 11], low: [1, 2, 6], swing: 0.25, wet: { months: [6], label: 'Rainy season' } },
  { code: 'SEL', name: 'Seoul', country: 'South Korea', flag: '🇰🇷', lat: 37.57, lon: 126.98, hub: 0.9, hotelNight: 130, foodDay: 55, vibes: ['food', 'nightlife', 'shopping'], blurb: 'Korean barbecue, karaoke and palaces between the skyscrapers.', highC: [2, 29], peak: [4, 5, 9, 10], low: [1, 2, 7], swing: 0.2, wet: { months: [7], label: 'Monsoon' } },
  { code: 'BKK', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', lat: 13.76, lon: 100.5, hub: 0.85, hotelNight: 90, foodDay: 35, vibes: ['food', 'nightlife', 'temples'], blurb: 'Street-food capital of the world and a launchpad to the islands.', highC: [32, 33], peak: [11, 12, 1, 2], low: [5, 6, 7, 8, 9], swing: 0.3, wet: { months: [6, 7, 8, 9, 10], label: 'Rainy season' } },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.35, lon: 103.82, hub: 0.82, hotelNight: 195, foodDay: 70, vibes: ['food', 'gardens', 'shopping'], blurb: 'Hawker centres and the world’s easiest airport to meet at.', highC: [30, 31], peak: [9, 12], low: [2, 5], swing: 0.1, wet: { months: [11, 12, 1], label: 'Monsoon' } },
  { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰', lat: 22.32, lon: 114.17, hub: 0.85, hotelNight: 185, foodDay: 70, vibes: ['food', 'views', 'hiking'], blurb: 'Dim sum, neon harbours and surprisingly wild hiking trails.', highC: [19, 31], peak: [3, 10, 11, 12], low: [6, 7, 8], swing: 0.25, wet: { months: [6, 7, 8, 9], label: 'Typhoon season' } },
  { code: 'DPS', name: 'Bali (Denpasar)', country: 'Indonesia', flag: '🇮🇩', lat: -8.65, lon: 115.22, hub: 1.0, hotelNight: 95, foodDay: 40, vibes: ['beach', 'nature', 'wellness'], blurb: 'Rice terraces, surf and villas that make group travel cheap and easy.', highC: [31, 29], peak: [7, 8, 12], low: [1, 2, 3, 11], swing: 0.35, wet: { months: [11, 12, 1, 2, 3], label: 'Wet season' } },
  { code: 'BOM', name: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.08, lon: 72.88, hub: 0.9, hotelNight: 110, foodDay: 35, vibes: ['food', 'culture', 'nightlife'], blurb: 'Bollywood, bhel puri and the buzz of India’s maximum city. Avoid the June–September monsoon.', highC: [31, 30], peak: [11, 12, 1, 2], low: [6, 7, 8, 9], swing: 0.25, wet: { months: [6, 7, 8, 9], label: 'Monsoon' } },
  { code: 'SYD', name: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.87, lon: 151.21, hub: 0.9, hotelNight: 185, foodDay: 90, vibes: ['beach', 'views', 'food'], blurb: 'Harbour icons and surf beaches: far for most, unforgettable for all. Summer is December to February.', highC: [26, 17], peak: [12, 1, 2], low: [6, 7, 8], swing: 0.3 },
];

const byCode = new Map(CITIES.map((c) => [c.code, c]));

export function getCity(code: string): City {
  const city = byCode.get(code);
  if (!city) throw new Error(`Unknown city code: ${code}`);
  return city;
}

export function cityLabel(code: string): string {
  const city = byCode.get(code);
  return city ? `${city.flag} ${city.name}` : code;
}

/** Hotel season for a city in a given month. */
export function seasonOf(city: City, month: number): Season {
  if (city.peak.includes(month)) return 'peak';
  if (city.low.includes(month)) return 'low';
  return 'shoulder';
}

/** Multiplier on the annual-average room rate for this month. */
export function hotelSeasonFactor(city: City, month: number): number {
  const season = seasonOf(city, month);
  if (season === 'peak') return 1 + city.swing;
  if (season === 'low') return 1 - city.swing * 0.8;
  return 1;
}

/**
 * Seasonal lag: temperatures peak around late July (late January south of
 * the equator), not mid-month, so August and September stay hot.
 */
const PEAK_MONTH = 7.4;
const LAG_SCALE = 1 / Math.cos((2 * Math.PI * (PEAK_MONTH - 7)) / 12);

/**
 * Average daily high for a month, interpolated along a lagged cosine that
 * passes exactly through the January and July normals. Accurate to a degree
 * or two for most cities; works for both hemispheres because the sign of the
 * swing flips.
 */
export function averageHighC(city: City, month: number): number {
  const [jan, jul] = city.highC;
  const mid = (jan + jul) / 2;
  const amp = ((jul - jan) / 2) * LAG_SCALE;
  return Math.round(mid + amp * Math.cos((2 * Math.PI * (month - PEAK_MONTH)) / 12));
}

export type WeatherNote = { highC: number; hazard?: string };

/** What to expect weather-wise; hazard covers storms, monsoons and extreme heat or cold. */
export function weatherFor(city: City, month: number): WeatherNote {
  const highC = averageHighC(city, month);
  if (city.wet?.months.includes(month)) return { highC, hazard: city.wet.label };
  if (highC >= 38) return { highC, hazard: 'Extreme heat' };
  if (highC <= 1) return { highC, hazard: 'Freezing' };
  return { highC };
}

export const REGIONS = [
  'Europe',
  'North America',
  'South America',
  'Middle East & Africa',
  'Asia & Oceania',
] as const;
export type Region = (typeof REGIONS)[number];

/** Continental grouping used to section the city picker. */
export function regionOf(city: City): Region {
  if (city.lon < -30) return city.lat > 12 ? 'North America' : 'South America';
  if (city.lon > 60) return 'Asia & Oceania';
  if (city.lat > 34 && city.lon < 45) return 'Europe';
  return 'Middle East & Africa';
}
