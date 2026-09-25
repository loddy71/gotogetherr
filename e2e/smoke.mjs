/**
 * End-to-end smoke test against the static web export.
 *
 * Usage:
 *   npm run build:web
 *   npm run e2e
 *
 * Drives the full happy path: create a trip with three friends (London,
 * New York, Tokyo), check rankings render, open the top destination, verify
 * the per-person breakdown, confirm the trip survives a reload, follow a
 * share link into the join flow, and capture the same screens in dark mode.
 * Screenshots for every step land in e2e/.artifacts/.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const PORT = 8899;
const ARTIFACTS = new URL('./.artifacts/', import.meta.url).pathname;
mkdirSync(ARTIFACTS, { recursive: true });
const shot = (name) => `${ARTIFACTS}${name}.png`;
// Entrance animations run ~0.5–0.9s; screenshots wait for them to settle.
const settle = (page) => page.waitForTimeout(1200);

// Static server with clean-URL rewrites (/join → join.html), matching how a
// real static host serves the expo export.
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};
const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const candidates = [
    join('dist', pathname === '/' ? 'index.html' : pathname),
    join('dist', `${pathname}.html`),
    'dist/index.html',
  ];
  const file = candidates.find((f) => existsSync(f) && !f.endsWith('/'));
  res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
  res.end(readFileSync(file));
}).listen(PORT);
await new Promise((r) => setTimeout(r, 300));

// Prefer an explicit CHROMIUM_PATH, then the sandbox's pre-installed browser,
// otherwise let Playwright resolve its own managed install (CI).
const chromiumPath =
  process.env.CHROMIUM_PATH ??
  (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

let browser;
try {
  browser = await chromium.launch(chromiumPath ? { executablePath: chromiumPath } : {});
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Find the fairest', { timeout: 15000 });
  console.log('home OK');

  await page.click('text=Plan a trip');
  await page.waitForSelector('text=Trip name', { timeout: 15000 });
  await page.fill('input[placeholder*="reunion"]', 'Summer reunion');
  console.log('form OK');

  const searchField = page.locator('input[placeholder*="Search cities"]');
  const addFriend = async (query, code) => {
    await page.click('text=Choose a city');
    await searchField.fill(query);
    await page.click(`[data-testid="city-option-${code}"]`);
    // The picker must close once a city is chosen.
    await searchField.waitFor({ state: 'hidden' });
  };
  await addFriend('london', 'LON');
  await addFriend('new york', 'NYC');
  await page.click('text=Add another friend');
  await addFriend('tokyo', 'TYO');
  console.log('travelers OK');

  await page.getByText('Add another friend').waitFor();
  await page.locator('input[placeholder*="reunion"]').scrollIntoViewIfNeeded();
  await settle(page);
  await page.screenshot({ path: shot('02-form') });
  await page.click('text=Find our city');
  await page.waitForSelector('text=Best match', { timeout: 20000 });
  const first = await page.getByRole('button', { name: /^1 / }).innerText();
  console.log('results OK, top pick:', first.replace(/\n/g, ' | '));
  await settle(page);
  await page.screenshot({ path: shot('03-results') });

  await page.getByRole('button', { name: /^1 / }).click();
  await page.waitForSelector('text=Who pays what', { timeout: 15000 });
  console.log('detail OK');

  // Veto: Friend 1 rules the top pick out; the ranking moves on without it.
  const vetoedCity = first.split('\n')[2];
  await page.getByRole('button', { name: `Friend 1 is in on ${vetoedCity}` }).click();
  await page.getByRole('button', { name: `Friend 1 is out on ${vetoedCity}` }).waitFor();
  await settle(page);
  await page.screenshot({ path: shot('11-veto') });
  await page.getByRole('button', { name: 'Back' }).filter({ visible: true }).first().click();
  await page.getByText('1 ruled out').waitFor({ timeout: 20000 });
  const afterVeto = (await page.getByRole('button', { name: /^1 / }).innerText()).split('\n')[2];
  if (afterVeto === vetoedCity) throw new Error(`veto ignored: ${vetoedCity} still ranked first`);
  console.log(`veto OK: ${vetoedCity} out, new top pick ${afterVeto}`);
  await settle(page);
  await page.screenshot({ path: shot('04-detail'), fullPage: true });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Summer reunion', { timeout: 15000 });
  console.log('persistence OK');
  await settle(page);
  await page.screenshot({ path: shot('01-home') });

  // Share → join flow: copy the invite link, open it in a fresh profile.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('text=Summer reunion');
  await page.waitForSelector('text=Best match', { timeout: 20000 });
  const shareButton = page.getByRole('button', { name: 'Share' }).filter({ visible: true }).first();
  await shareButton.click();
  await page.getByText('Copied').first().waitFor({ timeout: 5000 });
  const link = await page.evaluate(() => navigator.clipboard.readText());
  if (!link.includes('/join?d=')) throw new Error(`unexpected share link: ${link}`);

  const guest = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const joinUrl = new URL(link);
  await guest.goto(`http://localhost:${PORT}${joinUrl.pathname}${joinUrl.search}`, {
    waitUntil: 'networkidle',
  });
  await guest.waitForSelector("text=invited", { timeout: 15000 });
  await settle(guest);
  await guest.screenshot({ path: shot('05-join') });
  await guest.click('text=Add to my trips');
  await guest.waitForSelector('text=Best match', { timeout: 20000 });
  console.log('share/join OK');

  // Refine: a beach-only filter must put a beach city first, live.
  const BEACH_CITIES = ['Barcelona', 'Lisbon', 'Athens', 'Palma de Mallorca', 'Miami', 'Los Angeles', 'Cancún', 'Rio de Janeiro', 'Dubai', 'Cape Town', 'Bali (Denpasar)', 'Sydney'];
  await page.getByRole('button', { name: 'Refine' }).first().click();
  await page.getByText(/of \d+ cities match/).waitFor({ timeout: 5000 });
  // Restore the city vetoed earlier.
  await page.getByRole('button', { name: `Restore ${vetoedCity}` }).click();
  await page.getByText('1 ruled out').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Beach', exact: true }).click();
  await settle(page);
  await page.screenshot({ path: shot('09-refine-sheet') });
  await page.getByRole('button', { name: /^Show \d+ cities$/ }).click();
  await page.getByText(/of \d+ cities match/).waitFor({ state: 'hidden' });
  await page.waitForTimeout(600);
  const topPick = (await page.getByRole('button', { name: /^1 / }).innerText()).split('\n')[2];
  if (!BEACH_CITIES.includes(topPick)) throw new Error(`beach filter: top pick ${topPick} is not a beach city`);
  await settle(page);
  await page.screenshot({ path: shot('08-refined') });
  console.log(`refine OK, beach top pick: ${topPick}`);

  // When's cheapest: preview the cheapest month, then re-plan the trip for it.
  await page.getByText("When's cheapest?").waitFor({ timeout: 20000 });
  const cheapestColumn = page.getByRole('button', { name: /, cheapest$/ });
  const cheapestLabel = await cheapestColumn.getAttribute('aria-label');
  const cheapestMonthName = cheapestLabel.split(':')[0];
  await cheapestColumn.scrollIntoViewIfNeeded();
  await cheapestColumn.click();
  const meta = await page.getByText(/^\w+ · \d+ nights · \d+ flying in$/).first().innerText();
  const currentMonthName = meta.split(' · ')[0];
  if (cheapestMonthName !== currentMonthName) {
    const plan = page.getByRole('button', { name: `Plan for ${cheapestMonthName}` });
    await plan.waitFor({ timeout: 5000 });
    await settle(page);
    await page.screenshot({ path: shot('10-months') });
    await plan.click();
    await page
      .getByText(new RegExp(`^${cheapestMonthName} · \\d+ nights · \\d+ flying in$`))
      .waitFor({ timeout: 20000 });
  }
  console.log(`months OK, cheapest: ${cheapestLabel}`);

  // Dark mode: reuse the invite link so the same trip renders on dark stock.
  const darkContext = await browser.newContext({
    viewport: { width: 420, height: 900 },
    colorScheme: 'dark',
  });
  const darkPage = await darkContext.newPage();
  await darkPage.goto(`http://localhost:${PORT}${joinUrl.pathname}${joinUrl.search}`, {
    waitUntil: 'networkidle',
  });
  await darkPage.waitForSelector('text=invited', { timeout: 15000 });
  await darkPage.click('text=Add to my trips');
  await darkPage.waitForSelector('text=Best match', { timeout: 20000 });
  await settle(darkPage);
  await darkPage.screenshot({ path: shot('06-dark-results') });
  await darkPage.getByRole('button', { name: /^1 / }).click();
  await darkPage.waitForSelector('text=Who pays what', { timeout: 15000 });
  await settle(darkPage);
  await darkPage.screenshot({ path: shot('07-dark-detail') });
  await darkContext.close();
  console.log('dark mode OK');

  console.log('SMOKE PASS');
} finally {
  await browser?.close();
  server.close();
}
