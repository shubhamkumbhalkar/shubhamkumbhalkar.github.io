# Shubham Kumbhalkar Portfolio

Static Astro portfolio published through GitHub Pages.

## Local development

Use Node 24. The repository includes `.nvmrc` and `.node-version`.

```bash
nvm use
npm ci
npm run test:install
npm run dev
```

The development server binds to `127.0.0.1`.

## Verify

```bash
npm run verify
```

This runs Astro type checks, creates the static build in `dist/`, and runs the Playwright suite. Tests cover page headings, metadata, Person JSON-LD, responsive overflow, image loading, internal links, contrast, JavaScript-disabled content, and the contact form.

## Content

Public content lives in `src/data/`. Experience, work, writing, judging, education, testimonials, and contact details can be updated without changing page layouts.

Large static assets live in `public/`. The original root `index.html`, `style.css`, `script.js`, and asset copies are retained as migration history. They are not part of the Astro build.

## Deployment

`.github/workflows/deploy.yml` tests every pull request. Merges to `main` upload `dist/` and deploy through the official GitHub Pages Action.

Before the first deployment, set the repository's GitHub Pages source to **GitHub Actions**.
