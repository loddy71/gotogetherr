/**
 * City dataset used both as traveler origins and candidate destinations.
 *
 * Prices are rough 2026 mid-range estimates in USD and only feed the mock
 * pricing provider — a real provider (Amadeus/Kiwi) replaces them at quote
 * time, but they remain useful as fallbacks and for the "daily costs" line.
 *
 * - hotelNight: mid-range double room, per night
 * - foodDay: meals + local transport + a museum ticket, per person per day
 * - hub: airport competitiveness factor (lower = cheaper fares on average)
 */

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
};

export const CITIES: City[] = [
  // ── Europe ────────────────────────────────────────────────────────────
  { code: 'LON', name: 'London', country: 'United Kingdom', flag: '🇬🇧', lat: 51.51, lon: -0.13, hub: 0.85, hotelNight: 210, foodDay: 85, vibes: ['museums', 'nightlife', 'food'], blurb: 'World-class museums, pubs and theatre — pricey beds but cheap flights from everywhere.' },
  { code: 'PAR', name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.86, lon: 2.35, hub: 0.88, hotelNight: 220, foodDay: 90, vibes: ['romance', 'food', 'museums'], blurb: 'Cafés, galleries and grand boulevards; a classic that never needs justifying.' },
  { code: 'BCN', name: 'Barcelona', country: 'Spain', flag: '🇪🇸', lat: 41.39, lon: 2.17, hub: 0.9, hotelNight: 160, foodDay: 65, vibes: ['beach', 'nightlife', 'food'], blurb: 'Gaudí, tapas and a city beach — the crowd-pleaser of European reunions.' },
  { code: 'MAD', name: 'Madrid', country: 'Spain', flag: '🇪🇸', lat: 40.42, lon: -3.7, hub: 0.9, hotelNight: 140, foodDay: 60, vibes: ['nightlife', 'food', 'museums'], blurb: 'Late dinners, later nights, and the Prado — Spain at full volume.' },
  { code: 'LIS', name: 'Lisbon', country: 'Portugal', flag: '🇵🇹', lat: 38.72, lon: -9.14, hub: 0.95, hotelNight: 130, foodDay: 55, vibes: ['food', 'views', 'beach'], blurb: 'Hills, pastéis and Atlantic light at a friendlier price than most capitals.' },
  { code: 'ROM', name: 'Rome', country: 'Italy', flag: '🇮🇹', lat: 41.9, lon: 12.5, hub: 0.92, hotelNight: 170, foodDay: 70, vibes: ['history', 'food', 'romance'], blurb: 'Two thousand years of showing off, plus carbonara.' },
  { code: 'BER', name: 'Berlin', country: 'Germany', flag: '🇩🇪', lat: 52.52, lon: 13.4, hub: 0.92, hotelNight: 130, foodDay: 60, vibes: ['nightlife', 'history', 'art'], blurb: 'Clubs that never close and history on every corner, still decent value.' },
  { code: 'AMS', name: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', lat: 52.37, lon: 4.9, hub: 0.88, hotelNight: 200, foodDay: 80, vibes: ['canals', 'museums', 'nightlife'], blurb: 'Compact, bikeable and easy to reach — beds book out fast.' },
  { code: 'PRG', name: 'Prague', country: 'Czechia', flag: '🇨🇿', lat: 50.08, lon: 14.44, hub: 1.0, hotelNight: 110, foodDay: 45, vibes: ['history', 'beer', 'views'], blurb: 'Fairy-tale old town and Europe’s best beer money can barely buy.' },
  { code: 'BUD', name: 'Budapest', country: 'Hungary', flag: '🇭🇺', lat: 47.5, lon: 19.04, hub: 1.0, hotelNight: 100, foodDay: 40, vibes: ['baths', 'nightlife', 'history'], blurb: 'Thermal baths by day, ruin bars by night — big weekend, small bill.' },
  { code: 'KRK', name: 'Kraków', country: 'Poland', flag: '🇵🇱', lat: 50.06, lon: 19.94, hub: 1.05, hotelNight: 85, foodDay: 35, vibes: ['history', 'food', 'budget'], blurb: 'A gorgeous medieval square and the cheapest great weekend in Europe.' },
  { code: 'VIE', name: 'Vienna', country: 'Austria', flag: '🇦🇹', lat: 48.21, lon: 16.37, hub: 0.95, hotelNight: 150, foodDay: 65, vibes: ['music', 'cafes', 'museums'], blurb: 'Imperial palaces, concert halls and cake — civilised to a fault.' },
  { code: 'CPH', name: 'Copenhagen', country: 'Denmark', flag: '🇩🇰', lat: 55.68, lon: 12.57, hub: 0.92, hotelNight: 190, foodDay: 90, vibes: ['design', 'food', 'canals'], blurb: 'Hygge, harbour swims and new-Nordic food — bring a healthy budget.' },
  { code: 'DUB', name: 'Dublin', country: 'Ireland', flag: '🇮🇪', lat: 53.35, lon: -6.26, hub: 0.92, hotelNight: 180, foodDay: 75, vibes: ['pubs', 'music', 'history'], blurb: 'The craic is mighty and the transatlantic connections are even better.' },
  { code: 'EDI', name: 'Edinburgh', country: 'United Kingdom', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', lat: 55.95, lon: -3.19, hub: 1.0, hotelNight: 160, foodDay: 70, vibes: ['history', 'views', 'whisky'], blurb: 'A castle on a crag, closes and cosy pubs — dramatic in every weather.' },
  { code: 'ATH', name: 'Athens', country: 'Greece', flag: '🇬🇷', lat: 37.98, lon: 23.73, hub: 0.98, hotelNight: 110, foodDay: 50, vibes: ['history', 'food', 'sun'], blurb: 'The Acropolis plus souvlaki-fuelled nights, with islands one ferry away.' },
  { code: 'IST', name: 'Istanbul', country: 'Türkiye', flag: '🇹🇷', lat: 41.01, lon: 28.98, hub: 0.85, hotelNight: 95, foodDay: 40, vibes: ['history', 'food', 'bazaars'], blurb: 'Two continents, one city — epic food and a mega-hub airport.' },
  { code: 'REY', name: 'Reykjavík', country: 'Iceland', flag: '🇮🇸', lat: 64.15, lon: -21.94, hub: 1.05, hotelNight: 200, foodDay: 95, vibes: ['nature', 'hot springs', 'views'], blurb: 'Halfway point between Europe and North America, with lava fields thrown in.' },
  { code: 'STO', name: 'Stockholm', country: 'Sweden', flag: '🇸🇪', lat: 59.33, lon: 18.07, hub: 0.95, hotelNight: 170, foodDay: 80, vibes: ['design', 'islands', 'museums'], blurb: 'An archipelago city of clean lines and long summer light.' },
  { code: 'MIL', name: 'Milan', country: 'Italy', flag: '🇮🇹', lat: 45.46, lon: 9.19, hub: 0.9, hotelNight: 180, foodDay: 75, vibes: ['fashion', 'food', 'design'], blurb: 'Aperitivo culture, the Duomo and the lakes within day-trip reach.' },
  { code: 'PMI', name: 'Palma de Mallorca', country: 'Spain', flag: '🇪🇸', lat: 39.57, lon: 2.65, hub: 1.0, hotelNight: 150, foodDay: 60, vibes: ['beach', 'sun', 'food'], blurb: 'Proper beach weather and a surprisingly lovely old town.' },

  // ── North America ────────────────────────────────────────────────────
  { code: 'NYC', name: 'New York', country: 'United States', flag: '🇺🇸', lat: 40.71, lon: -74.01, hub: 0.85, hotelNight: 300, foodDay: 110, vibes: ['nightlife', 'food', 'museums'], blurb: 'The city that never sleeps — nor do its prices, but everything is here.' },
  { code: 'MIA', name: 'Miami', country: 'United States', flag: '🇺🇸', lat: 25.76, lon: -80.19, hub: 0.9, hotelNight: 220, foodDay: 90, vibes: ['beach', 'nightlife', 'sun'], blurb: 'Beach days, Cuban coffee and neon nights — winter sun for the Americas.' },
  { code: 'LAX', name: 'Los Angeles', country: 'United States', flag: '🇺🇸', lat: 34.05, lon: -118.24, hub: 0.85, hotelNight: 240, foodDay: 95, vibes: ['beach', 'food', 'sun'], blurb: 'Tacos, trails and Pacific sunsets, if the group can handle the sprawl.' },
  { code: 'SFO', name: 'San Francisco', country: 'United States', flag: '🇺🇸', lat: 37.77, lon: -122.42, hub: 0.88, hotelNight: 260, foodDay: 100, vibes: ['views', 'food', 'nature'], blurb: 'Fog, hills and phenomenal food a bridge away from redwoods.' },
  { code: 'CHI', name: 'Chicago', country: 'United States', flag: '🇺🇸', lat: 41.88, lon: -87.63, hub: 0.88, hotelNight: 200, foodDay: 85, vibes: ['architecture', 'food', 'music'], blurb: 'Big-shouldered architecture, deep dish and blues bars on the lake.' },
  { code: 'AUS', name: 'Austin', country: 'United States', flag: '🇺🇸', lat: 30.27, lon: -97.74, hub: 0.95, hotelNight: 190, foodDay: 80, vibes: ['music', 'food', 'nightlife'], blurb: 'Live music every night and barbecue worth the queue.' },
  { code: 'NOL', name: 'New Orleans', country: 'United States', flag: '🇺🇸', lat: 29.95, lon: -90.07, hub: 1.0, hotelNight: 180, foodDay: 80, vibes: ['music', 'food', 'nightlife'], blurb: 'Jazz, gumbo and go-cups — America’s best city for a group weekend.' },
  { code: 'LAS', name: 'Las Vegas', country: 'United States', flag: '🇺🇸', lat: 36.17, lon: -115.14, hub: 0.88, hotelNight: 150, foodDay: 90, vibes: ['nightlife', 'shows', 'desert'], blurb: 'Cheap flights and beds subsidised by the casino floor. What happens here…' },
  { code: 'YTO', name: 'Toronto', country: 'Canada', flag: '🇨🇦', lat: 43.65, lon: -79.38, hub: 0.9, hotelNight: 190, foodDay: 80, vibes: ['food', 'multicultural', 'museums'], blurb: 'A world of food in one grid of streets, with Niagara nearby.' },
  { code: 'YVR', name: 'Vancouver', country: 'Canada', flag: '🇨🇦', lat: 49.28, lon: -123.12, hub: 0.92, hotelNight: 200, foodDay: 85, vibes: ['nature', 'food', 'views'], blurb: 'Mountains meet ocean; sushi and seawall strolls between hikes.' },
  { code: 'MEX', name: 'Mexico City', country: 'Mexico', flag: '🇲🇽', lat: 19.43, lon: -99.13, hub: 0.9, hotelNight: 120, foodDay: 45, vibes: ['food', 'art', 'history'], blurb: 'Tacos al pastor, Frida and endless museums at altitude.' },
  { code: 'CUN', name: 'Cancún', country: 'Mexico', flag: '🇲🇽', lat: 21.16, lon: -86.85, hub: 0.92, hotelNight: 160, foodDay: 60, vibes: ['beach', 'sun', 'nightlife'], blurb: 'Caribbean water, cenotes and all-inclusive ease for mixed budgets.' },

  // ── South America ────────────────────────────────────────────────────
  { code: 'BOG', name: 'Bogotá', country: 'Colombia', flag: '🇨🇴', lat: 4.71, lon: -74.07, hub: 0.95, hotelNight: 90, foodDay: 40, vibes: ['food', 'art', 'mountains'], blurb: 'Street art, specialty coffee and green hills above the city.' },
  { code: 'MDE', name: 'Medellín', country: 'Colombia', flag: '🇨🇴', lat: 6.24, lon: -75.58, hub: 1.0, hotelNight: 80, foodDay: 35, vibes: ['spring weather', 'nightlife', 'views'], blurb: 'The city of eternal spring — cable cars, salsa and great value.' },
  { code: 'BUE', name: 'Buenos Aires', country: 'Argentina', flag: '🇦🇷', lat: -34.6, lon: -58.38, hub: 0.95, hotelNight: 100, foodDay: 45, vibes: ['food', 'nightlife', 'tango'], blurb: 'Steak, malbec and dancing until sunrise in Europe’s South American cousin.' },
  { code: 'RIO', name: 'Rio de Janeiro', country: 'Brazil', flag: '🇧🇷', lat: -22.91, lon: -43.17, hub: 0.95, hotelNight: 130, foodDay: 50, vibes: ['beach', 'views', 'nightlife'], blurb: 'Copacabana, Christ the Redeemer and caipirinhas at sunset.' },
  { code: 'LIM', name: 'Lima', country: 'Peru', flag: '🇵🇪', lat: -12.05, lon: -77.04, hub: 0.95, hotelNight: 90, foodDay: 40, vibes: ['food', 'coast', 'history'], blurb: 'One of the world’s great food cities, with cliffs over the Pacific.' },

  // ── Middle East & Africa ─────────────────────────────────────────────
  { code: 'DXB', name: 'Dubai', country: 'UAE', flag: '🇦🇪', lat: 25.2, lon: 55.27, hub: 0.82, hotelNight: 180, foodDay: 80, vibes: ['luxury', 'beach', 'shopping'], blurb: 'A mega-hub meeting point — half the planet is one direct flight away.' },
  { code: 'DOH', name: 'Doha', country: 'Qatar', flag: '🇶🇦', lat: 25.29, lon: 51.53, hub: 0.85, hotelNight: 150, foodDay: 70, vibes: ['museums', 'souqs', 'luxury'], blurb: 'Stopover city turned destination: souq, corniche and world-class museums.' },
  { code: 'MRK', name: 'Marrakesh', country: 'Morocco', flag: '🇲🇦', lat: 31.63, lon: -7.99, hub: 1.02, hotelNight: 90, foodDay: 40, vibes: ['souqs', 'food', 'desert'], blurb: 'Riads, mint tea and the Atlas mountains on the horizon.' },
  { code: 'CPT', name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', lat: -33.92, lon: 18.42, hub: 1.0, hotelNight: 110, foodDay: 50, vibes: ['nature', 'wine', 'beach'], blurb: 'Table Mountain, winelands and penguins — unbeatable value once you land.' },

  // ── Asia & Oceania ───────────────────────────────────────────────────
  { code: 'TYO', name: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.68, lon: 139.69, hub: 0.88, hotelNight: 150, foodDay: 60, vibes: ['food', 'nightlife', 'culture'], blurb: 'Ramen at 2am, temples at dawn — the trip your group chat deserves.' },
  { code: 'SEL', name: 'Seoul', country: 'South Korea', flag: '🇰🇷', lat: 37.57, lon: 126.98, hub: 0.9, hotelNight: 120, foodDay: 50, vibes: ['food', 'nightlife', 'shopping'], blurb: 'Korean barbecue, karaoke and palaces between the skyscrapers.' },
  { code: 'BKK', name: 'Bangkok', country: 'Thailand', flag: '🇹🇭', lat: 13.76, lon: 100.5, hub: 0.85, hotelNight: 80, foodDay: 35, vibes: ['food', 'nightlife', 'temples'], blurb: 'Street food capital of the world and a launchpad to the islands.' },
  { code: 'SIN', name: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.35, lon: 103.82, hub: 0.82, hotelNight: 200, foodDay: 65, vibes: ['food', 'gardens', 'shopping'], blurb: 'Hawker centres and the world’s easiest airport to meet at.' },
  { code: 'HKG', name: 'Hong Kong', country: 'Hong Kong', flag: '🇭🇰', lat: 22.32, lon: 114.17, hub: 0.85, hotelNight: 180, foodDay: 65, vibes: ['food', 'views', 'hiking'], blurb: 'Dim sum, neon harbours and surprisingly wild hiking trails.' },
  { code: 'BLI', name: 'Bali (Denpasar)', country: 'Indonesia', flag: '🇮🇩', lat: -8.65, lon: 115.22, hub: 1.0, hotelNight: 90, foodDay: 35, vibes: ['beach', 'nature', 'wellness'], blurb: 'Rice terraces, surf and villas that make group travel cheap and easy.' },
  { code: 'BOM', name: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.08, lon: 72.88, hub: 0.9, hotelNight: 100, foodDay: 30, vibes: ['food', 'culture', 'nightlife'], blurb: 'Bollywood, bhel puri and the buzz of India’s maximum city.' },
  { code: 'SYD', name: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.87, lon: 151.21, hub: 0.9, hotelNight: 200, foodDay: 85, vibes: ['beach', 'views', 'food'], blurb: 'Harbour icons and surf beaches — far for most, unforgettable for all.' },
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
