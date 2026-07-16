/**
 * End-to-end smoke test against the static web export.
 *
 * Usage:
 *   npm run build:web
 *   npm run e2e
 *
 * Drives the full happy path: create a trip with three friends (London,
 * New York, Tokyo), check rankings render, open the top destination,
 * verify the per-person breakdown and that the trip survives a reload.
 */
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 8899;
const ARTIFACTS = new URL('./.artifacts/', import.meta.url).pathname;
mkdirSync(ARTIFACTS, { recursive: true });
const shot = (name) => `${ARTIFACTS}${name}.png`;

const server = spawn('python3', ['-m', 'http.server', String(PORT), '-d', 'dist'], {
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 1000));

let browser;
try {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
  });
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Where should we all meet?', { timeout: 15000 });
  console.log('home OK');

  await page.click('text=Plan a trip');
  await page.waitForSelector('text=TRIP NAME', { timeout: 15000 });
  await page.fill('input[placeholder*="reunion"]', 'Summer reunion');
  console.log('form OK');

  const addFriend = async (query, rowText) => {
    await page.click('text=Flying from…');
    await page.fill('input[placeholder*="Search cities"]', query);
    await page.click(`text=${rowText}`);
  };
  await addFriend('london', '🇬🇧 London');
  await addFriend('new york', '🇺🇸 New York');
  await page.click('text=＋ Add a friend');
  await addFriend('tokyo', '🇯🇵 Tokyo');
  console.log('travelers OK');

  await page.screenshot({ path: shot('02-form') });
  await page.click('text=Find our city');
  await page.waitForSelector('text=avg / person', { timeout: 20000 });
  const first = await page.getByRole('button', { name: /^#1 / }).innerText();
  console.log('results OK, top pick:', first.replace(/\n/g, ' | '));
  await page.screenshot({ path: shot('03-results') });

  await page.getByRole('button', { name: /^#1 / }).click();
  await page.waitForSelector('text=PER-PERSON BREAKDOWN', { timeout: 15000 });
  console.log('detail OK');
  await page.screenshot({ path: shot('04-detail'), fullPage: true });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Summer reunion', { timeout: 15000 });
  console.log('persistence OK');
  await page.screenshot({ path: shot('01-home') });

  console.log('SMOKE PASS');
} finally {
  await browser?.close();
  server.kill();
}
