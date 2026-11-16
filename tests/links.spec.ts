import { expect, test } from '@playwright/test';
import { pages } from './pages';

const origin = 'http://127.0.0.1:4321';

test('every internal link and anchor resolves', async ({ page, request }) => {
  const targets = new Map<string, Set<string>>();

  for (const path of pages) {
    await page.goto(path);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );
    for (const href of hrefs) {
      const url = new URL(href);
      if (url.origin !== origin) continue;
      const fragments = targets.get(url.pathname) ?? new Set<string>();
      if (url.hash) fragments.add(decodeURIComponent(url.hash.slice(1)));
      targets.set(url.pathname, fragments);
    }
  }

  expect(targets.size).toBeGreaterThan(0);

  const broken: string[] = [];
  for (const [pathname, fragments] of targets) {
    const response = await request.get(pathname, { maxRedirects: 0 });
    if (response.status() !== 200) {
      broken.push(`${pathname} -> ${response.status()}`);
      continue;
    }
    if (fragments.size === 0) continue;
    await page.goto(pathname);
    for (const fragment of fragments) {
      if ((await page.locator(`[id="${fragment}"]`).count()) === 0) {
        broken.push(`${pathname}#${fragment} -> missing anchor`);
      }
    }
  }

  expect(broken).toEqual([]);
});

test('retained public files are served', async ({ request }) => {
  const files = [
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/favicon.svg',
    '/Resume_Shubham_Kumbhalkar.pdf',
    '/headshot.png',
    '/headshot.webp',
    '/og-image.png',
    '/certificates/HackMIT-2026-Certificate-and-Letter.pdf',
    '/certificates/InfinityX-Judge-Confirmation.pdf',
  ];
  for (const file of files) {
    const response = await request.get(file);
    expect(response.status(), file).toBe(200);
  }

  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of pages.filter((p) => p !== '/404.html')) {
    expect(sitemap).toContain(`<loc>https://shubhamkumbhalkar.github.io${path}</loc>`);
  }
});
