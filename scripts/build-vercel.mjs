// Reuse the verified static export with root URLs for Vercel hosting.
const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
if (!domain) throw new Error('Vercel must provide a deployment domain for website metadata');
process.env.GITHUB_PAGES_BASE_PATH = '';
process.env.GITHUB_PAGES_ORIGIN = `https://${domain}`;
await import('./build-github-pages.mjs');
