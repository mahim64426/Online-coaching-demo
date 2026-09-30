# SUMON Bright Coaching Center — Website

Static site (HTML/CSS/JS) for GitHub Pages. Upload the **contents of this folder** to the repository root (`index.html` must sit in the root).

## Before you go live (2 minutes)
1. Upload everything to your GitHub repo root, then enable Pages (Settings → Pages → Deploy from branch → `/ (root)`).
2. Put your real site URL into every canonical/sitemap/schema tag:
   `node tools/set-domain.js https://USERNAME.github.io/REPO` (or your custom domain), then commit.
   (Without this, `https://mahim64426.github.io/Online-coaching-demo` stays in canonical, sitemap.xml, robots.txt and JSON-LD.)
3. Google Search Console → add the property → submit `sitemap.xml` → "Request indexing" for the home page.
4. Google Business Profile: create/claim the listing with the same name, phone and address (biggest lever for "near me" and Bengali local searches).
5. Confirm phone, address and the district (`Jashore`) in the JSON-LD block of `index.html`.

## Admin demo
`admin/` is a browser-only demo. Login is a salted-hash gate (no plaintext in the repo) — it is **not real security**.
Change it: `node tools/make-auth.js "email" "password"` and paste the line into `assets/js/demo-auth.js`.
Real admin/auth/database: Supabase Auth + RLS. Never put service-role keys or Google OAuth secrets in front-end code.

## Notes
- `404.html` uses relative paths, so deep-URL 404s may lose styling on project pages; harmless for SEO.
- Replace demo fees/routine times with final data when ready.
