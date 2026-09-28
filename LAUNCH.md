# LAUNCH.md — from test mode to taking real money

The site's checkout (`pricing.html` → Stripe → `welcome.html`) is
demoable in test mode. Since 2026-09-28 the site sells one hosted app
with the library and the trust center inside it, and never mentions the
command line. A purchase is fulfilled by hand until buying creates the
trust center (workspace plan to-do 18): an operator runs
`rampguide-trust/tools/make-tenant.ts`, which emails the owner's
invitation. The key service still mints a library key at checkout; no
page shows it. This file is the checklist of **human decisions** that stand
between that and a live rampguide.com that charges cards, and the
exact steps to flip once each gate is cleared. Nothing below is
automated on purpose.

## Gates (a human decides; none can be faked)

| # | Gate | Owner | Status |
|---|---|---|---|
| 1 | **Legal entity on the Stripe account** — decision 7 in the workspace's plan-of-attack.md (the copyright entity is Spider Strategies, Inc.; the Stripe account is not settled). The Stripe account, the receipt emails, and the terms all name it. | leadership | open |
| 2 | **Stripe account** in that entity's name, with two products (RampGuide, Complete), each carrying one *yearly recurring* price (the form's `tier` value for the first is still `library`, the key service's name for it); optionally the founding-customer coupon. | Nate | open |
| 3 | **Final prices.** Nate said on 2026-09-17 the recommended $12,000 / $25,000 was probably high, so the site now says RampGuide **$6,000/yr** ($500/mo; the app, the library and the trust center) · Complete **$15,000/yr** per cloud service offering, Founding customers 50% off year one for the first ten who sign before 2026-12-31. These are placeholders until Nate names the numbers. Change them in `pricing.html`, `index.html` (offering cards, pricing strip, alternatives row, meta description), `LAUNCH.md`, the dev server's display labels, and the Stripe prices together. | Nate | placeholder |
| 4 | **Terms of service and refund language.** `terms.html` is a draft with the refund clause left as a bracketed choice; `privacy.html` is a draft. Both carry a red DRAFT banner, `noindex`, and are **not linked from any nav or footer**. Once approved: remove the banner and `noindex`, link them from the footer, and set the terms URL in Stripe (Settings → Public details) so Checkout can show it. | leadership | draft |
| 5 | **A contact address.** The site's Contact links, the trust center "tell us" buttons, the welcome page, and the drafts all use `nathan@spiderstrategies.com` (Nate's call, 2026-09-17) because rampguide.com has **no MX records** (dropped at the DNS move — see rampguide-api/OPERATIONS.md). To move to a rampguide.com address later: add a forwarder (ImprovMX/SES), then change the address in `src/` and rebuild. | Nate | done for now |
| 6 | **Engine distribution.** Decided 2026-09-25: the engine is private and proprietary (© Spider Strategies, Inc.) and is included with the hosted product. Since 2026-09-28 (Nate: no command line on the site) the site sells the hosted app and never mentions a command line, a library key or `rampguide add`; a buyer whose boundary requires an in-house build is a sales conversation, and needs the license terms of plan §5.8. The public-release promise and "free" are gone. `terms.html` §4 still says the compiler and importer are "provided free of charge under their own license" (a draft, legal text; plan §5.8). It does not link npm (the published `rampguide@0.0.0` is a placeholder). | Nate | decided; terms §4 open |
| 7 | **Two pricing-page claims to eyeball.** The platform price anchor reads "The leading hosted platform lists a FedRAMP Rev5 package at $25,000 to $60,000 a year by impact level, and $55,000 to $125,000 with continuous monitoring (its published prices, read 2026-09-28)", and the home page's comparison row says the same (issue #8). Read from paramify.com/pricing on 2026-09-28, FedRAMP Legacy Rev5 tab: Low $25,000 package / $55,000 with ConMon; Moderate $45,000 / $95,000; High $60,000 / $125,000; one offering each. Re-check before launch; competitors change list prices. And "278 of the 323 Rev5 Moderate controls mapped" (derived from catalog.json; re-run the count when packs change). The trust center page carries FedRAMP's per-rule-set dates (read from fedramp.gov on 2026-09-28); re-check them too. | Nate | review |
| 8 | **Nate's explicit go** before the `sell` branch merges to `main` — GitHub Pages deploys straight from `main`, so the merge *is* the launch. | Nate | open |
| 9 | **Trust center wording.** The home page (offering tile + section 09), the pricing page and `trust-center.html` say the trust center is live and hosted at trust.rampguide.com (since 2026-09-23; issue #7), what it does, and that every plan includes one per offering (2026-09-28: the library is bundled into the app, and the trust center is part of the app; plan §5.5 recommended including it). Confirm the inclusion before launch. | Nate | review |
| 10 | **"We've been through it" claims** (home page section 03). The copy says RampGuide "comes from a software company that holds a FedRAMP authorization of its own and has kept it current for years", that the engine "was written to generate our own submission" and "a real, assessed program has been through the importer", and that onboarding is done by "the same people who maintain our own package". The company, product, impact level, and year are deliberately unnamed (no-customer-names rule). Nate decides whether to name them and confirms each sentence is true as written. | Nate | review |
| 11 | **The one-business-day promise.** The pricing page, its questions and `welcome.html` say that within one business day of a purchase we create the trust center and email the owner's invitation, and on Complete offer a time for the call that brings the existing SSP in. Someone has to watch the Stripe dashboard (or its email notifications) for every purchase and run `make-tenant.ts` for it. | Nate | open |

## Steps: test mode (demo this week)

Everything runs with no Stripe account at all (the dev server simulates
Stripe at the seam), or against a real Stripe **test-mode** account.

**No account — the demo rig:**

```bash
# terminal 1: the API with simulated Stripe, pointed at the local site
cd rampguide-api && node tools/dev-server.ts --port 8787 --site http://127.0.0.1:4173

# terminal 2: the site
cd rampguide-site && python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/pricing.html → fill Organization / Cloud
service offering → Continue to checkout → the simulated Stripe page
(banner says so) → Pay → `welcome.html` says what happens next. Cancel
the subscription (`curl -X POST http://127.0.0.1:8787/fake-stripe/cancel-subscription/<cs_…>`)
and the key service revokes the key it minted (403).

**With a real Stripe test-mode account:**

1. Dashboard → toggle *Test mode*. Product catalog → add product
   "RampGuide", price $6,000.00 / year (recurring, yearly) →
   copy the `price_…` id. Same for "RampGuide Complete" at $15,000.00.
2. Optional coupon: Product catalog → Coupons → "Founding customer",
   50% off, duration *once*, max redemptions 10 → copy the coupon id.
3. Developers → Webhooks → add endpoint
   `https://api.rampguide.com/v1/stripe/webhook`, events
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
   `customer.subscription.deleted` → copy the signing secret `whsec_…`.
   (For a local API use the Stripe CLI: `stripe listen --forward-to
   localhost:8787/v1/stripe/webhook` and its printed secret.)
4. Deploy with the test values — Nate runs this (the sandbox blocks
   CloudFormation from Claude):

   ```bash
   cd rampguide-api && AWS_PROFILE=rampguide \
     STRIPE_SECRET_KEY=sk_test_… STRIPE_WEBHOOK_SECRET=whsec_… \
     STRIPE_PRICE_LIBRARY=price_… STRIPE_PRICE_COMPLETE=price_… \
     STRIPE_FOUNDING_COUPON=… \
     bash tools/deploy.sh
   ```

   Values are stored as stack parameters; later deploys without these
   variables keep them.
5. Serve the `sell` branch somewhere Stripe can redirect to (a local
   preview works: the pages post to the production API when served
   from any host other than localhost — for a localhost preview the
   forms target `http://127.0.0.1:8787` unless `?api=` overrides). Or
   merge to a preview branch with GitHub Pages on that branch.
6. Buy with the test card `4242 4242 4242 4242`, any future expiry,
   any CVC. The welcome page says what happens next; the purchases
   table has the row.
7. Dashboard → Customers → cancel the test subscription immediately →
   the key is refused within seconds (CloudWatch shows the
   `customer.subscription.deleted` line with the revoked hash prefix).

## Steps: flipping to live (after every gate above)

1. In Stripe, leave test mode. Recreate the two products/prices and the
   coupon in live mode (test and live catalogs are separate). Add the
   live webhook endpoint (same URL) and copy its live `whsec_…`.
   Settings → Public details: business name (the entity from gate 1),
   support email (gate 5), terms URL (gate 4). Settings → Emails: turn
   on customer receipts for successful payments.
2. Deploy the live values — the same command as above with `sk_live_…`
   and the live price/coupon/webhook ids.
3. Smoke test in live mode with a real card for the smallest amount
   you're willing to refund, or skip and rely on the test-mode pass —
   the code path is identical; only the credentials differ.
4. Merge `sell` into `main` in rampguide-site and push. GitHub Pages
   republishes within a minute or two. Check
   https://rampguide.com/pricing.html renders and the form's `action`
   is `https://api.rampguide.com/v1/checkout`.
5. Watch CloudWatch for the first real `checkout.session.completed`
   and `minted: "checkout"` lines. The purchases table
   (`PurchasesTableName` stack output) is the customer ledger.

## What stays manual, by design

- Every purchase: create its trust center within one business day
  (`rampguide-trust/tools/make-tenant.ts`; `rampguide-trust/OPERATIONS.md`).
- Keys for design partners or replacements: `tools/make-key.ts`.
- A customer who lost the key before copying it: revoke by hash
  (purchases table → `keyHash`), mint a replacement, send it.
- Ending the founding offer: redeploy with `STRIPE_FOUNDING_COUPON=""`.
- Refunds, invoicing, purchase orders, multi-offering deals: Stripe
  dashboard and email.
