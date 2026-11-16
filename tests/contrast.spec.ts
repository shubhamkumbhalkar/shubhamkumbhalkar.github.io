import { expect, test, type Page } from '@playwright/test';
import { pages } from './pages';

const minimumRatio = 4.5;

interface Failure {
  text: string;
  ratio: number;
  color: string;
  background: string;
}

async function findLowContrastText(page: Page): Promise<Failure[]> {
  return page.evaluate((minimum) => {
    type Rgba = [number, number, number, number];

    const parse = (value: string): Rgba | null => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    };

    const blend = (top: Rgba, bottom: Rgba): Rgba => {
      const alpha = top[3] + bottom[3] * (1 - top[3]);
      if (alpha === 0) return [0, 0, 0, 0];
      const channel = (i: number) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / alpha;
      return [channel(0), channel(1), channel(2), alpha];
    };

    const luminance = ([r, g, b]: Rgba) => {
      const linear = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
    };

    const backgroundOf = (element: Element): Rgba => {
      const layers: Rgba[] = [];
      for (let node: Element | null = element; node; node = node.parentElement) {
        const layer = parse(getComputedStyle(node).backgroundColor);
        if (layer && layer[3] > 0) {
          layers.push(layer);
          if (layer[3] >= 1) break;
        }
      }
      let result: Rgba = [255, 255, 255, 1];
      for (const layer of layers.reverse()) result = blend(layer, result);
      return result;
    };

    const failures: { text: string; ratio: number; color: string; background: string }[] = [];
    const elements = Array.from(document.body.querySelectorAll<HTMLElement>('*'));
    for (const element of elements) {
      const ownText = Array.from(element.childNodes)
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent ?? '')
        .join('')
        .trim();
      if (!ownText) continue;
      if (element.closest('.visually-hidden, .skip-link, script, style, noscript')) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) continue;

      const style = getComputedStyle(element);
      const foreground = parse(style.color);
      if (!foreground) continue;
      const background = backgroundOf(element);
      const text = blend(foreground, background);
      const lighter = Math.max(luminance(text), luminance(background));
      const darker = Math.min(luminance(text), luminance(background));
      const ratio = (lighter + 0.05) / (darker + 0.05);
      if (ratio < minimum) {
        failures.push({
          text: ownText.slice(0, 60),
          ratio: Math.round(ratio * 100) / 100,
          color: style.color,
          background: `rgb(${background.slice(0, 3).map(Math.round).join(', ')})`,
        });
      }
    }
    return failures;
  }, minimumRatio);
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme contrast`, () => {
    test.use({ colorScheme });

    for (const path of pages) {
      test(`${path} text meets ${minimumRatio}:1`, async ({ page }) => {
        await page.goto(path);
        expect(await findLowContrastText(page)).toEqual([]);
      });
    }
  });
}

test('dark theme follows prefers-color-scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const light = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: 'dark' });
  const dark = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(light).toBe('rgb(248, 250, 252)');
  expect(dark).toBe('rgb(2, 6, 23)');
});
