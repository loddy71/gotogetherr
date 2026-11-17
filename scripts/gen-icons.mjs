/**
 * Renders the app icon, Android adaptive layers, splash mark and favicon
 * from scripts/icon/mark.svg with headless Chromium (Playwright).
 *
 *   node scripts/gen-icons.mjs
 *
 * Re-run after editing the mark; outputs land in assets/images/.
 */
import { existsSync, readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const svg = readFileSync(new URL('./icon/mark.svg', import.meta.url), 'utf8');
const mark = svg.match(/<g id="mark"[\s\S]*?<\/g>/)[0];
const PAPER = '#F3F0E8';

/** The mark scaled by `scale` about the centre, on `background` (or transparent). */
function compose({ size, scale = 1, background = PAPER, monochrome = false }) {
  let body = mark;
  if (monochrome) body = body.replace(/(stroke|fill)="#[0-9A-Fa-f]{6}"/g, '$1="#FFFFFF"').replace(/stroke="#FFFFFF" stroke-width="28"/, 'stroke="none"');
  const offset = (1024 * (1 - scale)) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="${size}" height="${size}">
    ${background ? `<rect width="1024" height="1024" fill="${background}"/>` : ''}
    <g transform="translate(${offset} ${offset}) scale(${scale})">${body}</g></svg>`;
}

const OUTPUTS = [
  // iOS / default icon: full bleed paper, the OS rounds the corners.
  { file: 'icon.png', size: 1024, scale: 0.92 },
  // Android adaptive: foreground within the 66% safe zone on transparent.
  { file: 'android-icon-foreground.png', size: 512, scale: 0.62, background: null },
  { file: 'android-icon-background.png', size: 512, scale: 0, background: PAPER, empty: true },
  { file: 'android-icon-monochrome.png', size: 432, scale: 0.62, background: null, monochrome: true },
  // Splash: mark on transparent; app.json sets the paper background.
  { file: 'splash-icon.png', size: 400, scale: 1, background: null },
  { file: 'favicon.png', size: 48, scale: 1.3 },
];

const executablePath = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
try {
  const page = await browser.newPage();
  for (const o of OUTPUTS) {
    const markup = o.empty
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${o.size}" height="${o.size}"><rect width="100%" height="100%" fill="${PAPER}"/></svg>`
      : compose(o);
    await page.setViewportSize({ width: o.size, height: o.size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}</style>${markup}`);
    await page.locator('svg').screenshot({ path: `assets/images/${o.file}`, omitBackground: true });
    console.log(`assets/images/${o.file}`);
  }
} finally {
  await browser.close();
}
