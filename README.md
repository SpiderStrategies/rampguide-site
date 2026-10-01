# rampguide-site

The RampGuide marketing site: static HTML and CSS, self-hosted Nebula Sans,
no trackers, and no external JavaScript. The product is a hosted workspace
for preparing, reviewing, publishing and sharing FedRAMP and CMMC packages.

## Editing and previewing

Edit `src/*.html`, including `src/how-it-works.html`, and the shared
partials in `src/partials/`. The small build script assembles the pages
GitHub Pages serves from the repository root:

```sh
node tools/build.ts
node tools/build.ts --check
python3 -m http.server 4173 --bind 127.0.0.1
```

Node 22.18 or later; no site dependencies. Styles live in `site.css`.
Preview at http://127.0.0.1:4173. The app runs separately on localhost:8790.
Checkout forms retain the app's `/v1/checkout` integration; on localhost,
`src/partials/local-app.html` points them at that local app. An unavailable
checkout displays the returned error instead of claiming a purchase succeeded.

## Current product photography

All app images are `img/ews-*-20261001.webp`, captured on October 1, 2026
from the actual application at 1440 x 1000 and 390 x 844 CSS pixels, at 2x.
There are 18 current desktop/mobile captures. Old screenshot assets and the
old animated dependency-graph walkthrough were removed. The walkthrough
URL now explains the actual answer / review / build / publish workflow.

The user requested an EWS Group / MoversSuite demonstration. Company and
product context comes from https://ewsgroup.com/; people, implementation,
architecture, safeguards and results are fictional. Each screenshot-bearing
page states that this is an illustrative scenario, not a customer endorsement,
actual EWS assessment or certification. The application's company name also
includes “(demo)”. Do not remove those distinctions.

The local scene has one company and one CMMC Level 2 package, 110 answered
requirements, six open gaps, eleven tasks, staff/customer/assessor roles,
access requests and decisions, three snapshots and one private change awaiting
review. Customers receive the summary and inventory; the SSP, gap plan and
SPRS data remain assessor-only. No real assessment or SPRS submission is seeded.

Workspace evidence and tools: `../notes/ews-demo-2026-10-01/`.
`capture.mjs` captures the live app without changing its HTML or CSS.
`verify-site.mjs` checks all nine pages at five widths and renders `og.png`
from `tools/og.html`. The social preview also uses a current app capture.
Run these from the workspace root with the local app and site preview running.

## Content boundaries

- Describe implemented behavior. Answers generate documents; review, build
  and publication are separate actions. Publication is not certification.
- Do not promise automatic regulatory updates, automated evidence collection,
  independent verification, assessment outcomes or automatic SPRS submission.
- Available library material must be reviewed against the team's actual system.
- Pricing remains $6,000 or $15,000 per package per year. Complete includes
  onboarding assistance. Do not promise an automatic discount or delivery time
  unless checkout configuration and the service agreement support it.
- API details are linked to the service's current OpenAPI contract. Marketing
  pages do not present repositories or command-line tools as the customer workflow.
- Terms and privacy pages remain unapproved drafts, noindex and unlinked from
  navigation. See `LAUNCH.md` for release gates; this refresh does not approve them.

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

