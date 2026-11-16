import { expect, test } from '@playwright/test';
import { audiencePaths } from './pages';

const paths = [
  { href: '/for/editors/', label: /Editors & program committees/ },
  { href: '/for/hiring/', label: /Hiring managers/ },
  { href: '/for/engineers/', label: /Engineers/ },
];

/** Text each destination must show, proving it carries evidence for that reader. */
const evidence: Record<string, RegExp[]> = {
  '/for/editors/': [/BLOG@CACM/, /SSRN/, /IJRET|International Journal of Research in Engineering/, /HackMIT 2026/, /Alumni Conclave 2026/, /ORCID/],
  '/for/hiring/': [/500K\+/, /\+\$1\.1M/, /Russell Vernick/, /Phani Pradeep Kommana/, /Pankaj Sharma/, /Jianju Liu/, /Download resume/],
  '/for/engineers/': [/Agent Skills/, /Application Autofill/, /GitHub profile/, /AI Agents Move From Code Generation/],
};

const privateItems = /\b(?:submitted|under review|manuscript in preparation)\b/i;

test('home chooser shows all three paths and reaches each by keyboard', async ({ page }) => {
  await page.goto('/');
  const chooser = page.locator('#paths');
  await expect(chooser.getByRole('heading', { level: 2 })).toBeVisible();

  for (const path of paths) {
    const link = chooser.getByRole('link', { name: path.label });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', path.href);
  }

  // The chooser must sit high on the page: its top within roughly the first two screens on a phone.
  await page.setViewportSize({ width: 390, height: 844 });
  const top = await chooser.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(top).toBeLessThan(844 * 1.5);

  const reached = new Set<string>();
  for (let press = 0; press < 30 && reached.size < paths.length; press += 1) {
    await page.keyboard.press('Tab');
    const href = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.closest('#paths') ? active.getAttribute('href') : null;
    });
    if (href) reached.add(href);
  }
  expect([...reached].sort()).toEqual(paths.map((p) => p.href).sort());

  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/for\/hiring\/$/);
});

test('primary navigation has at most six items', async ({ page }) => {
  await page.goto('/');
  const count = await page.locator('nav[aria-label="Primary"] a').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(6);
});

test.describe('audience pages without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of audiencePaths) {
    test(`${path} shows audience-relevant evidence`, async ({ page }) => {
      await page.goto(path);
      const main = page.locator('main');
      for (const pattern of evidence[path]) {
        await expect(main, `${path} should mention ${pattern}`).toContainText(pattern);
      }
      expect(await main.innerText()).not.toMatch(privateItems);
      // Every in-page jump link resolves to a section on the same page.
      const anchors = await page.locator('nav[aria-label="On this page"] a').evaluateAll((links) =>
        links.map((link) => link.getAttribute('href') ?? ''),
      );
      expect(anchors.length).toBeGreaterThan(2);
      for (const anchor of anchors) {
        await expect(page.locator(anchor)).toBeVisible();
      }
      // The other two paths are linked, so a shared URL leads onward.
      const others = audiencePaths.filter((other) => other !== path);
      for (const other of others) {
        await expect(page.locator(`nav[aria-labelledby="other-paths-heading"] a[href="${other}"]`)).toBeVisible();
      }
    });
  }

  test('home chooser links work without JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.locator('#paths').getByRole('link', { name: /Engineers/ }).click();
    await expect(page).toHaveURL(/\/for\/engineers\/$/);
    await expect(page.locator('h1')).toContainText('Open source');
  });
});

test('no private manuscripts appear anywhere on home', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('body').innerText()).not.toMatch(privateItems);
});
