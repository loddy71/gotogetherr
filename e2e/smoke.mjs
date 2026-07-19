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
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const PORT = 8899;
const ARTIFACTS = new URL('./.artifacts/', import.meta.url).pathname;
mkdirSync(ARTIFACTS, { recursive: true });
const shot = (name) => `${ARTIFACTS}${name}.png`;

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
  const first = await page.getByRole('button', { name: /^1 / }).innerText();
  console.log('results OK, top pick:', first.replace(/\n/g, ' | '));
  await page.screenshot({ path: shot('03-results') });

  await page.getByRole('button', { name: /^1 / }).click();
  await page.waitForSelector('text=PER-PERSON BREAKDOWN', { timeout: 15000 });
  console.log('detail OK');
  await page.screenshot({ path: shot('04-detail'), fullPage: true });

  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Summer reunion', { timeout: 15000 });
  console.log('persistence OK');
  await page.screenshot({ path: shot('01-home') });

  // Share → join flow: copy the invite link, open it in a fresh profile.
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.click('text=Summer reunion');
  await page.waitForSelector('text=avg / person', { timeout: 20000 });
  await page.click('text=Share');
  await page.waitForSelector('text=Copied!', { timeout: 5000 });
  const link = await page.evaluate(() => navigator.clipboard.readText());
  if (!link.includes('/join?d=')) throw new Error(`unexpected share link: ${link}`);

  const guest = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const joinUrl = new URL(link);
  await guest.goto(`http://localhost:${PORT}${joinUrl.pathname}${joinUrl.search}`, {
    waitUntil: 'networkidle',
  });
  await guest.waitForSelector("text=invited to plan", { timeout: 15000 });
  await guest.screenshot({ path: shot('05-join') });
  await guest.click('text=Add to my trips');
  await guest.waitForSelector('text=avg / person', { timeout: 20000 });
  console.log('share/join OK');

  console.log('SMOKE PASS');
} finally {
  await browser?.close();
  server.close();
}
