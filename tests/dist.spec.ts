import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { placeholderPattern } from './pages';

const distDir = new URL('../dist/', import.meta.url).pathname;

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return full.endsWith('.html') ? [full] : [];
  });
}

test('built HTML contains no placeholder text', () => {
  const files = htmlFiles(distDir);
  expect(files.length).toBeGreaterThan(0);
  const offenders = files.filter((file) => {
    const visible = readFileSync(file, 'utf8')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ');
    return placeholderPattern.test(visible);
  });
  expect(offenders).toEqual([]);
});
