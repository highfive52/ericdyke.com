# Setup:
- https://nodejs.org/en/download

# Run:
- $env:PATH = "C:\Program Files\nodejs\;" + $env:PATH

summary 
- dev = edit mode
- build = package mode
- preview = production simulation mode

## dev
npm run dev

- Purpose: local development.
- What it does: starts Vite’s dev server with hot module reload (HMR).
- Speed: fastest feedback loop.
- Output: serves files from memory; does not create optimized production files in dist.
- Use when: you are actively coding and want instant refresh.

npm run dev -- --host 0.0.0.0 --port 5173

- makes the site available to the local network for testing.
- other machines and mobile devices on the same wifi can see the site.

## build 
npm run build

- Purpose: production compilation.
- What it does: runs TypeScript checks (tsc) and bundles/minifies assets with Vite for production.
- Output: writes optimized static files to dist.
- Use when: you want a deployable build or to verify production compile succeeds.

## preview
npm run preview

- Purpose: test the production build locally.
- What it does: starts a local server that serves the already-built dist output.
- Requirement: you should run npm run build first (or dist may be stale/missing).
- Use when: you want to validate what users will actually get in production.
- Quick mental model:

## Deploy checklist (SiteGround FTP → https://ericdyke.com)

Hosting: https://www.siteground.com  
SiteGround runs LiteSpeed with its own **Dynamic Cache** layer. Purging that cache after
upload is the single most important step — without it browsers receive stale HTML
that references removed hashed JS/CSS bundles and the site goes blank.

### Step-by-step

1. Run `npm run build` locally.
2. Confirm `dist/.htaccess` exists (it is auto-copied by the postbuild script).
3. In your FTP client, **enable "show hidden files"** so `.htaccess` is visible and uploaded.
4. Upload files from `dist` to the site root in this order:
   - `dist/assets/` (new hashed JS/CSS files) — upload first so they exist before index.html is live.
   - `dist/.htaccess`
   - `dist/index.html` — upload last.
5. Do **not** delete old `assets/` files before upload; delete them only after new files are confirmed live.
6. **Purge SiteGround Dynamic Cache** — this is mandatory after every deploy:
   - Log in to https://my.siteground.com → Site Tools → Speed → Caching.
   - Click **Flush Cache** (or "Dynamic Cache" → Flush).
   - If CDN is enabled, flush the CDN cache too.
7. Validate in a private/incognito window (avoids local browser cache):
   - `https://ericdyke.com/`
   - `https://ericdyke.com/education`
   - `https://ericdyke.com/resume`

### If it still looks blank after the above

- Open Chrome DevTools → Network tab → reload. Check that `/assets/index-*.js` and
  `/assets/index-*.css` return **200** with the correct MIME type (not HTML).
- If any asset returns HTML or 404, the SiteGround cache was not fully flushed, or the
  file upload was incomplete.
- As a last resort, use SiteGround File Manager (Site Tools → Files → File Manager) to
  verify `.htaccess` exists at the site root and contains the rewrite rules.

### Notes

- `index.html` has no hash in its name, so browsers rely on the server's cache headers
  to know when it changes. SiteGround's cache flush is what forces the fresh copy.
- Hashed `assets/` files are immutably cached by the browser — once deployed correctly
  they never need re-fetching until the hash changes.

