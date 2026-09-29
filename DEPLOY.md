# Deploying the Jonaks Beauty website

This is a Next.js site (Home, About, Portfolio, Booking) that exports to plain static files. It needs no database, no environment variables you have to create by hand, and no server.

Requirements: Node.js 22.13 or newer (https://nodejs.org).

## Run it on your computer

```sh
npm ci
npm run dev
```

Open the address it prints (usually http://localhost:5173).

## Option 1: Vercel (simplest)

1. Put this folder in a GitHub repository (or use the Vercel CLI: `npx vercel`).
2. On https://vercel.com choose **Add New → Project** and import the repository.
3. Leave the settings as they are. `vercel.json` already sets the build command (`node scripts/build-vercel.mjs`) and the output folder (`github-pages`).
4. Click **Deploy**. Add your own domain under **Settings → Domains**.

## Option 2: GitHub Pages

1. Push this folder to a GitHub repository whose default branch is `main`.
2. In the repository go to **Settings → Pages → Source** and choose **GitHub Actions**.
3. Every push to `main` builds and publishes the site (`.github/workflows/pages.yml`).
4. The address will be `https://<your-username>.github.io/<repository-name>/`. For a custom domain or a different repository name, set `GITHUB_PAGES_BASE_PATH` and `GITHUB_PAGES_ORIGIN` in that workflow file (see README.md).

## Option 3: Any static host (Netlify, Cloudflare Pages, your own server)

```sh
GITHUB_PAGES_BASE_PATH="" GITHUB_PAGES_ORIGIN="https://your-domain.com" npm run build:github-pages
```

Upload the contents of the generated `github-pages/` folder. Set the base path to a sub-folder such as `/site` only if the site lives in one.

## Things you may want to change

- **Page text and prices:** `app/page.tsx`, `app/about/page.tsx`, `app/portfolio/page.tsx`, `app/booking/page.tsx`.
- **Portfolio photos:** add images to `public/gallery/` and list them at the top of `app/portfolio/page.tsx`.
- **Colours and styling:** `app/globals.css`.
- **Site address in link previews:** `app/layout.tsx` (`metadataBase`), or set `GITHUB_PAGES_ORIGIN` when building.
- **WhatsApp, email and Instagram links:** `app/components/Shell.tsx` and `app/booking/page.tsx`.
