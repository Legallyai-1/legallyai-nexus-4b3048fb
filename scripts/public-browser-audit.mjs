import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(pathToFileURL(process.env.QA_PLAYWRIGHT_PATH).href);
const base = new URL(process.env.QA_BASE_URL || 'https://www.legallyai.ai/');
if (base.protocol !== 'https:' || !['www.legallyai.ai', 'legallyai.ai'].includes(base.hostname)) {
  throw new Error('Public audit only permits LegallyAI HTTPS domains');
}
const output = 'browser-audit-results';
await mkdir(output, { recursive: true });
const results = [];
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
    await context.route('**/*', async route => {
      const host = new URL(route.request().url()).hostname;
      const advertising = ['googlesyndication.com', 'doubleclick.net', 'googleadservices.com', 'googletagservices.com'];
      if (advertising.some(domain => host === domain || host.endsWith(`.${domain}`))) {
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    for (const path of ['/', '/pricing', '/login']) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      const result = { url: new URL(path, base).href, viewport, failures: [], pageErrors: errors };
      try {
        const response = await page.goto(result.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        if (!response || response.status() >= 400) result.failures.push(`HTTP ${response?.status()}`);
        await page.locator('main').waitFor({ state: 'visible', timeout: 20000 });
        await page.waitForTimeout(1500);
        const main = page.locator('main');
        const text = await main.innerText();
        if (path === '/') {
          const hub = main.locator('a[href="/custody"]').filter({ hasText: 'CustodiAI' });
          if (await hub.count() !== 1) result.failures.push('CustodiAI homepage card missing or duplicated');
          else {
            const label = await hub.innerText();
            if (/premium/i.test(label)) result.failures.push('AI hub still advertises Premium badge');
            if (!/AI Powered/i.test(label)) result.failures.push('AI Powered label missing');
          }
        }
        if (path === '/' || path === '/pricing') {
          for (const required of ['Solo Lawyer', 'Large Firm', '$29', '$99', '$149', '7-day free trial']) {
            if (!text.toLowerCase().includes(required.toLowerCase())) result.failures.push(`Missing pricing text: ${required}`);
          }
          if (/\bcustom\b|contact sales/i.test(text)) result.failures.push('Custom pricing remains');
          if (/automated payments are currently disabled|contact admin/i.test(text)) result.failures.push('Paid enrollment unavailable');
        }
        if (path === '/login') {
          if (await page.locator('input[type="email"]').count() !== 1) result.failures.push('Login email field missing or duplicated');
          if (await page.locator('input[type="password"]').count() !== 1) result.failures.push('Login password field missing or duplicated');
          if (await page.getByRole('button', { name: /sign in/i }).count() !== 1) result.failures.push('Sign-in submit button missing or duplicated');
          if (!await page.locator('a[href="/forgot-password"]').count()) result.failures.push('Password recovery link missing');
          result.note = 'Form presence only: authenticated sign-in, recovery email and session persistence are not tested.';
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
        if (overflow) result.failures.push('Horizontal viewport overflow');
        result.links = await main.locator('a').evaluateAll(links => links.map(link => ({ text: link.textContent.trim(), href: link.getAttribute('href') })));
        const name = `${viewport.width}-${path === '/' ? 'home' : path.slice(1)}`;
        await page.screenshot({ path: `${output}/${name}.png`, fullPage: true, animations: 'disabled' });
      } catch (error) {
        result.failures.push(error.message);
      } finally {
        page.off('pageerror', onError);
      }
      if (errors.length) result.failures.push('Uncaught browser errors');
      results.push(result);
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(`${output}/report.json`, JSON.stringify({ generatedAt: new Date().toISOString(), advertisingRequestsBlocked: true, scope: 'Public rendered-page checks; no login submissions, purchases, ad clicks or confidential data', results }, null, 2));
}
const failed = results.filter(result => result.failures.length);
console.log(JSON.stringify({ checked: results.length, failed: failed.length, failures: failed.map(({ url, viewport, failures }) => ({ url, viewport, failures })) }, null, 2));
if (failed.length) process.exitCode = 1;
