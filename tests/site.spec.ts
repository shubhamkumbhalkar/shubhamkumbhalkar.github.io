import { expect, test, type Page } from '@playwright/test';
import { caseStudyPaths, pages, placeholderPattern } from './pages';

const widths = [320, 390, 1280];

async function open(page: Page, path: string) {
  const response = await page.goto(path, { waitUntil: 'load' });
  return response;
}

test.describe('every page', () => {
  for (const path of pages) {
    test(`${path} has one h1, metadata and Person JSON-LD`, async ({ page }) => {
      const response = await open(page, path);
      if (path !== '/404.html') expect(response?.status()).toBe(200);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      expect((await page.locator('h1').innerText()).trim().length).toBeGreaterThan(0);

      expect((await page.title()).trim().length).toBeGreaterThan(0);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /\S/);
      await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /\S/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://shubhamkumbhalkar.github.io/og-image.png',
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /og-image\.png$/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        /^https:\/\/shubhamkumbhalkar\.github\.io\//,
      );

      const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
      const parsed = JSON.parse(jsonLd ?? '{}') as { '@graph'?: Array<Record<string, unknown>> };
      const person = parsed['@graph']?.find((node) => node['@type'] === 'Person');
      expect(person?.name).toBe('Shubham Kumbhalkar');
    });

    for (const width of widths) {
      test(`${path} has no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, path);
        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
            .filter((el) => el.getBoundingClientRect().right > root.clientWidth + 1)
            .filter((el) => !el.closest('.visually-hidden'))
            .slice(0, 5)
            .map((el) => `${el.tagName.toLowerCase()}.${el.className}`);
          return { scrollWidth: root.scrollWidth, clientWidth: root.clientWidth, offenders };
        });
        expect(overflow.offenders, `elements wider than viewport`).toEqual([]);
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
      });
    }

    test(`${path} loads every image`, async ({ page }) => {
      await open(page, path);
      const images = page.locator('img');
      const count = await images.count();
      for (let index = 0; index < count; index += 1) {
        const image = images.nth(index);
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
            message: `image ${await image.getAttribute('src')} should load`,
          })
          .toBe(true);
      }
    });

    test(`${path} contains no placeholder text`, async ({ page }) => {
      await open(page, path);
      const text = await page.locator('body').innerText();
      expect(text).not.toMatch(placeholderPattern);
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of pages) {
    test(`${path} shows all content`, async ({ page }) => {
      await open(page, path);
      const hidden = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('main *'))
          .filter((el) => {
            const style = getComputedStyle(el);
            return style.opacity === '0' || style.visibility === 'hidden';
          })
          .map((el) => el.tagName.toLowerCase()),
      );
      expect(hidden).toEqual([]);
      await expect(page.locator('main h1')).toBeVisible();
    });
  }

  test('home page renders every migrated section', async ({ page }) => {
    await open(page, '/');
    const sections = [
      'about',
      'work',
      'writing',
      'judging',
      'recognition',
      'experience',
      'projects',
      'opensource',
      'skills',
      'education',
      'testimonials',
      'blog',
      'contact',
    ];
    for (const id of sections) {
      await expect(page.locator(`#${id} h2`)).toBeVisible();
    }
    await expect(page.locator('#experience li h3')).toHaveCount(5);
    await expect(page.locator('#judging .entry-list > li')).toHaveCount(11);
    await expect(page.locator('#testimonials figure')).toHaveCount(4);
    await expect(page.locator('#work .entry-list > li')).toHaveCount(caseStudyPaths.length);
  });

  test('contact form posts to the Formspree endpoint', async ({ page }) => {
    await open(page, '/');
    const form = page.locator('#contact-form');
    await expect(form).toHaveAttribute('action', 'https://formspree.io/f/xvkokgnp');
    await expect(form).toHaveAttribute('method', 'POST');
    for (const name of ['name', 'email', 'message']) {
      await expect(form.locator(`[name="${name}"]`)).toHaveAttribute('required', '');
    }
  });
});
