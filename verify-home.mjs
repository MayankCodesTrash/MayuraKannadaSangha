import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:5176/', { waitUntil: 'networkidle' });
await page.waitForSelector('text=Mayura Kannada Sangha');
await page.screenshot({ path: '/tmp/shot-1-top.png' });

// nav bar should be transparent, large logo at top
const navBg1 = await page.evaluate(() => getComputedStyle(document.querySelector('nav')).backgroundColor);
const logoHeight1 = await page.evaluate(() => document.querySelector('nav img').getBoundingClientRect().height);

// scroll down past threshold
await page.evaluate(() => window.scrollTo(0, 300));
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/shot-2-scrolled-nav.png' });
const navBg2 = await page.evaluate(() => getComputedStyle(document.querySelector('nav')).backgroundColor);
const logoHeight2 = await page.evaluate(() => document.querySelector('nav img').getBoundingClientRect().height);

// scroll further into the hero to check video scrub
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
await page.waitForTimeout(500);
await page.screenshot({ path: '/tmp/shot-3-mid-scrub.png' });
const videoTime = await page.evaluate(() => document.querySelector('video')?.currentTime);

// scroll to blank yellow section
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));
await page.waitForTimeout(300);
await page.screenshot({ path: '/tmp/shot-4-yellow-section.png' });

// scroll to footer
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1000);
await page.screenshot({ path: '/tmp/shot-5-footer.png' });
const footerText = await page.evaluate(() => document.querySelector('footer')?.innerText);

// check nav links navigate
await page.goto('http://localhost:5176/events', { waitUntil: 'networkidle' });
await page.waitForSelector('h1');
const eventsHeading = await page.evaluate(() => document.querySelector('h1')?.innerText);
await page.screenshot({ path: '/tmp/shot-6-events-placeholder.png' });

await browser.close();

console.log(JSON.stringify({
  navBg1, logoHeight1, navBg2, logoHeight2, videoTime, footerText, eventsHeading, errors
}, null, 2));
