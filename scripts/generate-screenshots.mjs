import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log("Launching Playwright...");
  const browser = await chromium.launch();
  const page = await browser.newPage({ 
    viewport: { width: 1600, height: 4000 },
    deviceScaleFactor: 2 
  });
  
  console.log("Navigating to Marketing Studio...");
  await page.goto('http://localhost:3000/marketing-studio', { waitUntil: 'networkidle' });

  console.log("Waiting for animations to settle...");
  await page.waitForTimeout(2000); // Wait for Recharts to animate

  const screenshotsDir = path.join(__dirname, '../public/screenshots');

  console.log("Capturing Shot 1 (Dashboard Hero)...");
  await page.locator('#shot-1').screenshot({ path: path.join(screenshotsDir, 'screenshot1.png'), type: 'png' });

  // Equalize shot-2 and shot-3: measure both, force both to the tallest
  console.log("Equalizing shot-2 and shot-3 heights...");
  const [height2, height3] = await page.evaluate(() => {
    const s2 = document.querySelector('#shot-2');
    const s3 = document.querySelector('#shot-3');
    return [s2.getBoundingClientRect().height, s3.getBoundingClientRect().height];
  });
  const equalHeight = Math.max(height2, height3);
  console.log(`  shot-2: ${height2}px, shot-3: ${height3}px → equalizing to ${equalHeight}px`);
  await page.evaluate((h) => {
    document.querySelector('#shot-2').style.height = h + 'px';
    document.querySelector('#shot-3').style.height = h + 'px';
  }, equalHeight);

  console.log("Capturing Shot 2 (Cumulative Chart)...");
  await page.locator('#shot-2').screenshot({ path: path.join(screenshotsDir, 'screenshot2.png'), type: 'png' });

  console.log("Capturing Shot 3 (Burn Distribution)...");
  await page.locator('#shot-3').screenshot({ path: path.join(screenshotsDir, 'screenshot3.png'), type: 'png' });

  await browser.close();
  console.log("Superb marketing screenshots successfully generated!");
})();
