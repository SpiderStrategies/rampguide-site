# rampguide-site

The rampguide.com website: static pages, no framework, no trackers, no
external JavaScript. Typeface: Nebula Sans, self-hosted in `fonts/`
(SIL OFL — license alongside).

**Edit `src/`, not the root pages.** Each page in `src/` is plain HTML
with a `<!-- page {…} -->` header (title, description, social text,
noindex, the footer's extra legal sentence) and `<!-- include: nav -->`
markers that pull the shared head, navs, footers, and scripts from
`src/partials/`. Then:

```sh
node tools/build.ts          # writes the root *.html (commit them too —
                             # GitHub Pages serves the repo as is)
node tools/build.ts --check  # fails if a root page is stale
```

No dependencies; Node ≥ 22 runs the script directly. `how-it-works.html`
is not built — it is a self-contained page and stays edited by hand.

- `index.html` — the marketing page: hero, the animated build
  storyboard, before/after, the three product mocks, why, the library,
  the alternatives, a pricing strip, the closing call to action.
- `pricing.html` — the three plans and the signup forms. Each form
  posts (`tier`, `org`, `cso`) to `https://api.rampguide.com/v1/checkout`
  (rampguide-api), which redirects to Stripe's hosted Checkout. Card
  data never touches this site.
- `welcome.html` — Stripe's success page. Reads `session_id` from the
  URL, calls `/v1/claim` once, and shows the library key exactly once.
- `product.html` — the product tour: five real `rampguide ui` screenshots
  (`img/ui-*.png`, captured from a fictional ACME repo with a few fields
  left open), the command line underneath, and the interactive
  walkthrough embedded.
- `trust-center.html` — product two, described from the design memo as
  *coming*; honest about status.
- `how-it-works.html` — the interactive dependency-graph demo (canonical;
  the workspace `rampguide-depgraph.html` is a derived copy).
- `terms.html`, `privacy.html` — DRAFTS, `noindex`, not linked from any
  nav until approved (see LAUNCH.md).
- `site.css` — shared styles. `fonts/` — Nebula Sans woff2 + license.
- `LAUNCH.md` — the human gates and the exact test→live steps.
- `CNAME` — created automatically by GitHub when the custom domain is set;
  leave it committed.

Local preview: `python3 -m http.server 4173 --bind 127.0.0.1` here, and
`node tools/dev-server.ts --port 8787 --site http://127.0.0.1:4173` in
rampguide-api. When served from localhost, the forms and the welcome
page target that dev API (override with `?api=http://host:port`).

All example content is fictional (ACME Corp, NestPortal). No customer
names, no pack prose — the library catalog on the page is names,
variants, and control counts only.

## Deployment (GitHub Pages)

Hosted on GitHub Pages, deploying straight from `main`. Every push to
`main` republishes the site.

One-time setup:

1. Repo → **Settings → Pages** → Source: **Deploy from a branch** →
   Branch: `main`, folder `/ (root)`.
2. Under **Custom domain**, enter `rampguide.com` and save. GitHub commits
   a `CNAME` file to the repo.
3. DNS for rampguide.com:
   - Apex `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` `CNAME` → `spiderstrategies.github.io`
4. Once DNS propagates and the cert issues, check **Enforce HTTPS**.
5. Org → **Settings → Pages → Verified domains**: verify `rampguide.com`
   (prevents domain takeover if the Pages site is ever deleted).

Note: publishing Pages from a private repo requires a paid GitHub plan.
The published site is public regardless of repo visibility.

