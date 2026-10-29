import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
if (!process.env.QA_PLAYWRIGHT_PATH) {
  console.error('QA_PLAYWRIGHT_PATH is not set. Point it at playwright/index.mjs, e.g. QA_PLAYWRIGHT_PATH="$PWD/.playwright-qa/node_modules/playwright/index.mjs".');
  process.exit(2);
}
const { chromium } = await import(pathToFileURL(process.env.QA_PLAYWRIGHT_PATH).href);
// CI points QA_BASE_URL at a local preview of this commit's build; the production default is for manual spot checks only.
const base = (process.env.QA_BASE_URL || 'https://www.legallyai.ai').replace(/\/+$/, '');
const output = 'interactive-login-results';
await mkdir(output, { recursive: true });
const results = [];
const browser = await chromium.launch();
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 720 }]) {
    for (const scenario of ['empty-validation', 'malformed-email', 'mocked-rejected-login', 'external-return', 'pricing-return']) {
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      let tokenRequests = 0;
      let otherWritesBlocked = 0;
      const errors = [];
      const result = { scenario, viewport, status: 'failed', failures: [] };
      const page = await context.newPage();
      page.on('pageerror', () => errors.push('Uncaught browser exception'));
      await context.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.hostname === 'whdljtbtqisoszbrzdwq.supabase.co' && url.pathname === '/auth/v1/token' && request.method() === 'POST') {
          tokenRequests++;
          if (scenario !== 'mocked-rejected-login') return route.abort();
          return route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code: 'invalid_credentials', error_code: 'invalid_credentials', msg: 'Invalid login credentials', error_description: 'Invalid login credentials' }) });
        }
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) { otherWritesBlocked++; return route.abort(); }
        return route.continue();
      });
      try {
        const query = scenario === 'external-return' ? '?returnTo=https%3A%2F%2Fexample.com%2F' : scenario === 'pricing-return' ? '?returnTo=%2Fpricing' : '';
        const response = await page.goto(base + '/login' + query, { waitUntil: 'domcontentloaded', timeout: 45000 });
        assert.ok(response && response.status() < 400, 'Login page HTTP response failed');
        await page.getByRole('heading', { name: 'Welcome Back', exact: true }).waitFor({ timeout: 20000 });
        const form = page.locator('form');
        const email = form.locator('#email');
        const password = form.locator('#password');
        const submit = form.getByRole('button', { name: 'Sign In', exact: true });
        assert.equal(await email.count(), 1, 'Email field missing or duplicated');
        assert.equal(await password.getAttribute('type'), 'password', 'Password field is not masked');
        if (scenario === 'empty-validation') {
          await submit.click();
          await form.locator('#email[aria-invalid="true"]').waitFor();
          await form.locator('#password[aria-invalid="true"]').waitFor();
          assert.equal(tokenRequests, 0, 'Invalid form attempted authentication');
        } else if (scenario === 'malformed-email') {
          await email.fill('not-an-email');
          await password.fill('SyntheticOnly123!');
          await submit.click();
          assert.equal(await email.evaluate(el => el.validity.typeMismatch), true, 'Malformed email was not rejected');
          assert.equal(tokenRequests, 0, 'Malformed form attempted authentication');
        } else if (scenario === 'mocked-rejected-login') {
          await email.fill('login-qa@example.invalid');
          await password.fill('SyntheticOnly123!');
          await submit.click();
          await page.getByText('Invalid login credentials', { exact: true }).waitFor({ timeout: 15000 });
          await submit.waitFor({ state: 'visible' });
          assert.equal(await submit.isEnabled(), true, 'Submit remained disabled after rejection');
          assert.equal(tokenRequests, 1, 'Expected one intercepted authentication request');
          assert.equal(new URL(page.url()).pathname, '/login', 'Rejected login left the sign-in page');
        } else {
          const href = await page.getByRole('link', { name: 'Create one', exact: true }).getAttribute('href');
          assert.equal(href, scenario === 'pricing-return' ? '/signup?returnTo=%2Fpricing' : '/signup', 'Unsafe or lost return destination');
          assert.equal(tokenRequests, 0, 'Page navigation attempted authentication');
        }
        assert.equal(errors.length, 0, 'Uncaught browser exception');
        await email.fill('');
        await password.fill('');
        await page.screenshot({ path: `${output}/${viewport.width}-${scenario}.png`, fullPage: true, animations: 'disabled' });
        result.status = 'passed';
      } catch (error) {
        result.failures.push(error instanceof Error ? error.message : 'Browser interaction failed; inspect the job step and screenshot');
        await page.locator('form #email').fill('').catch(() => {});
        await page.locator('form #password').fill('').catch(() => {});
        await page.screenshot({ path: `${output}/${viewport.width}-${scenario}-failed.png`, fullPage: true }).catch(() => {});
      } finally {
        result.interceptedTokenRequests = tokenRequests;
        result.otherWritesBlocked = otherWritesBlocked;
        results.push(result);
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  const report = { generatedAt: new Date().toISOString(), testedCommit: process.env.CI_COMMIT_SHA || process.env.GITHUB_SHA || null, baseUrl: base, scope: 'Rendered login interactions against baseUrl. All authentication token responses are mocked; all other non-read requests are blocked.', realAuthenticationVerified: false, successfulLoginVerified: false, sessionPersistenceVerified: false, logoutVerified: false, protectedRoutesVerified: false, results };
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2) + '\n');
}
if (results.length !== 10 || results.some(result => result.status !== 'passed')) process.exitCode = 1;
