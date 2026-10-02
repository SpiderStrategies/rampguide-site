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
All pages load `local-app.js`. On a loopback preview, start with
`http://localhost:4173/?trust=http://localhost:8790`; this selection follows
navigation, sign-in and checkout, including new tabs. Only plain loopback
HTTP(S) origins are accepted. Production ignores preview overrides entirely.

For separate disposable demo ports, start the app with its matching site origin:

```sh
# From rampguide-trust; use a new state directory for a cold start.
node tools/dev-server.ts --port 8810 --state /tmp/rampguide-demo-state --site http://localhost:4180
# From rampguide-site.
python3 -m http.server 4180 --bind 127.0.0.1
```

Open `http://localhost:4180/?trust=http://localhost:8810`. `--site` accepts
only a loopback origin; the app accepts its loopback host aliases on that
exact port. Checkout forms use the app's `/v1/checkout`. With no Stripe key,
payment is simulated and email is captured, never sent. The success page
labels that boundary and links the local captured invitation and enrollment.
A returned checkout error stays visible. A direct visit to the welcome page
is not proof of a completed checkout.

Regression checks: `node --test test/*.test.*` and `node tools/build.ts --check`.

Pricing explains the package boundary before asking for a system name. Public
import and welcome guidance distinguish FedRAMP Word/OSCAL preparation from the
supported CMMC Level 2 workbook path; neither establishes an assessment result.
The browser regression uses the sibling app's existing Chrome driver and disposable
servers; it verifies desktop/phone navigation, visible Sign in, native keyboard
validation and the actual checkout-to-enrollment links. It does not complete a passkey
ceremony. The app's `test/local-handoff.test.ts` covers custom preview origins,
foreign-origin rejection, simulated fulfillment, return URL and captured mail.

## Current product photography

All app images are `img/alderwick-*-20261002.webp`, captured on October 2,
2026 from the actual application at 1440 x 1000 and 390 x 844 CSS pixels,
at 2x. There are 18 desktop/mobile captures. The social preview is rendered
from `tools/og.html` using the same current workbench capture.

Alderwick Software and ServiceLedger are entirely fictional. Company,
product, people, implementation, architecture, safeguards and results are
illustrative demo data, not a customer endorsement, assessment or certification.
All screenshot-bearing pages say so. Do not replace these assets with customer
content or screenshots containing real customer names.

The isolated local scene has one company and one CMMC Level 2 package,
110 answered requirements, six open gaps, eleven tasks, staff/customer/assessor
roles, access requests and decisions, three snapshots and one private change
awaiting review. Customers receive the summary and inventory; the system
security plan, gap plan and SPRS data remain assessor-only. No actual
assessment or SPRS submission is seeded.

Capture and verification evidence: `notes/consolidation-2026-10-02/evidence/site/`
in the development workspace. The reproducible private fixture/capture scripts
live separately under `notes/consolidation-2026-10-02/private/site-demo/`; they
create a fresh local app state and capture its rendered UI without changing
HTML, CSS or screenshot pixels. Never serve that private state or captured mail.

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
