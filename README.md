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

The site sells one hosted app, with the library and the trust center
inside it, and never mentions a command line, a library key or
`rampguide add` (Nate, 2026-09-28), and never sells the app's plumbing
as a benefit: no "same host", no "not an integration", no builds, repos,
byte-identical output or word counts the buyer never sees (Nate,
2026-09-28: "we're hosting it"). A fact is set once in the workbench, an
owner presses Publish, and readers have the new package; say that. The pictures of the app are drawn in
the site's own paper (`.app`, `.ui` in `src/index.html`) or are the
screenshots in `img/`; the dark file windows show files, never a prompt.

- `index.html` — the marketing page: hero (a generated document and the
  Publish steps), what we sell, the storyboard (a value changed in the
  workbench, reviewed and committed, the documents updated, the package
  an agency reads), how it works, before/after, the library, the trust
  center, the alternatives, a pricing strip, the closing call to action.
- `pricing.html` — two plans (RampGuide and Complete; the trust center is
  in both), which frameworks it builds today (the full list; the home
  page's Frameworks card is its short form, and both change the week the
  app's list does), and the signup forms. Each form
  posts (`plan`, `org`, `offering`, and the trust center owner's `name`
  and work `email`) to `https://trust.rampguide.com/v1/checkout`, the
  app's own checkout (rampguide-trust, README "Buying"), which redirects to
  Stripe's hosted Checkout. Card data never touches this site. When Stripe
  says the payment cleared, the app creates the trust center and invites
  the owner. Until Stripe is set up the checkout sends the buyer back with
  `?error=unavailable`, which the page words as "Online checkout is not
  open yet".
- `welcome.html` — Stripe's success page: RampGuide is on its way
  (the owner's invitation within minutes, passkeys, setup, the
  workbench). Static; it shows no key and calls nothing.
- `product.html` — the product tour of the hosted app: six screenshots
  (`img/app-*.png`, captured 2026-09-28 from a local instance of
  rampguide-trust with the fictional ACME RoadRunner tenant) of the
  workbench (a question, a value chip, review and commit), Publish,
  Access, and the package as an agency reads it; then the interactive
  walkthrough embedded.
- `trust-center.html` — the trust center, live at trust.rampguide.com
  since 2026-09-23: what an agency does there, what Publish does, where it
  runs (hosted, one per company with a page per package, in every plan), and an honest list of
  what is and is not built.
- `api.html` — the trust center's API for programs: the OpenAPI document,
  three ways to authenticate, and every route and rule, read live from
  `trust.rampguide.com/v1/openapi.json` when the page opens (the trust
  center's own `/docs` redirects here). `?trust=http://localhost:8790`
  reads a local instance on a local preview.
- `how-it-works.html` — the interactive dependency-graph demo (canonical;
  the workspace `rampguide-depgraph.html` is a derived copy).
- `terms.html`, `privacy.html` — DRAFTS, `noindex`, not linked from any
  nav until approved (see LAUNCH.md). Since 2026-09-28 they describe the
  hosted app and the data it holds; the bracketed decisions and a
  lawyer's read remain.
- `site.css` — shared styles. `fonts/` — Nebula Sans woff2 + license.
- `LAUNCH.md` — the human gates and the exact test→live steps.
- `CNAME` — created automatically by GitHub when the custom domain is set;
  leave it committed.

Local preview: `python3 -m http.server 4173 --bind 127.0.0.1` here, and
`npm run dev` in rampguide-trust (the app on localhost:8790, with Stripe
simulated). When served from localhost, the pricing forms post to that
local app (override with `?trust=http://localhost:<port>`), so a purchase
runs end to end: the simulated Stripe page, the welcome page, and the
owner's invitation in the app's `.local/mail.log`.

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

