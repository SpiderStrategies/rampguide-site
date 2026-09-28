# LAUNCH.md — from test mode to taking real money

The site's checkout (`pricing.html` → Stripe → `welcome.html`) runs end
to end locally with Stripe simulated. Since 2026-09-28 the site sells one
hosted app with the library and the trust center inside it, and never
mentions the command line. The pricing forms post to the app itself,
`https://trust.rampguide.com/v1/checkout` (rampguide-trust, README
"Buying"); when Stripe says the payment cleared, the app creates the
trust center and emails the owner the form named an invitation that
leads into setup. No key is minted and nothing is fulfilled by hand. The
old key service, api.rampguide.com, is retired. Until the Stripe keys are
in the app's stack, the checkout sends the buyer back with "Online
checkout is not open yet". This file is the checklist of **human decisions** that stand
between that and a live rampguide.com that charges cards, and the
exact steps to flip once each gate is cleared. Nothing below is
automated on purpose.

## Gates (a human decides; none can be faked)

| # | Gate | Owner | Status |
|---|---|---|---|
| 1 | **Legal entity on the Stripe account** — decision 7 in the workspace's plan-of-attack.md (the copyright entity is Spider Strategies, Inc.; the Stripe account is not settled). The Stripe account, the receipt emails, and the terms all name it. | leadership | open |
| 2 | **Stripe account** in that entity's name, with two products (RampGuide, Complete), each carrying one *yearly recurring* price (the forms' `plan` values are `rampguide` and `complete`); optionally the founding-customer coupon. | Nate | open |
| 3 | **Final prices.** Nate said on 2026-09-17 the recommended $12,000 / $25,000 was probably high, so the site now says RampGuide **$6,000/yr** ($500/mo; the app, the library and the trust center) · Complete **$15,000/yr** per cloud service offering, Founding customers 50% off year one for the first ten who sign before 2026-12-31. These are placeholders until Nate names the numbers. Change them in `pricing.html`, `index.html` (offering cards, pricing strip, alternatives row, meta description), `LAUNCH.md`, the dev server's display labels, and the Stripe prices together. | Nate | placeholder |
| 4 | **Terms of service and refund language.** `terms.html` is a draft with the refund clause left as a bracketed choice; `privacy.html` is a draft. Both carry a red DRAFT banner, `noindex`, and are **not linked from any nav or footer**. Once approved: remove the banner and `noindex`, link them from the footer, and set the terms URL in Stripe (Settings → Public details) so Checkout can show it. | leadership | draft |
| 5 | **A contact address.** The site's Contact links, the trust center "tell us" buttons, the welcome page, and the drafts all use `nathan@spiderstrategies.com` (Nate's call, 2026-09-17) because rampguide.com has **no MX records** (dropped at the DNS move). To move to a rampguide.com address later: add a forwarder (ImprovMX/SES), then change the address in `src/` and rebuild. | Nate | done for now |
| 6 | **Engine distribution.** Decided 2026-09-25: the engine is private and proprietary (© Spider Strategies, Inc.) and is included with the hosted product. Since 2026-09-28 (Nate: no command line on the site) the site sells the hosted app and never mentions a command line, a library key or `rampguide add`; a buyer whose boundary requires an in-house build is a sales conversation, and needs the license terms of plan §5.8. The public-release promise and "free" are gone. `terms.html` §4 still says the compiler and importer are "provided free of charge under their own license" (a draft, legal text; plan §5.8). It does not link npm (the published `rampguide@0.0.0` is a placeholder). | Nate | decided; terms §4 open |
| 7 | **Two pricing-page claims to eyeball.** The platform price anchor reads "The leading hosted platform lists a FedRAMP Rev5 package at $25,000 to $60,000 a year by impact level, and $55,000 to $125,000 with continuous monitoring (its published prices, read 2026-09-28)", and the home page's comparison row says the same (issue #8). Read from paramify.com/pricing on 2026-09-28, FedRAMP Legacy Rev5 tab: Low $25,000 package / $55,000 with ConMon; Moderate $45,000 / $95,000; High $60,000 / $125,000; one offering each. Re-check before launch; competitors change list prices. And "278 of the 323 Rev5 Moderate controls mapped" (derived from catalog.json; re-run the count when packs change). The trust center page carries FedRAMP's per-rule-set dates (read from fedramp.gov on 2026-09-28); re-check them too. | Nate | review |
| 8 | **Nate's explicit go** before any branch merges to `main` — GitHub Pages deploys straight from `main`, so the merge *is* the launch. | Nate | open |
| 9 | **Trust center wording.** The home page (offering tile + section 09), the pricing page and `trust-center.html` say the trust center is live and hosted at trust.rampguide.com (since 2026-09-23; issue #7), what it does, and that every plan includes one per offering (2026-09-28: the library is bundled into the app, and the trust center is part of the app; plan §5.5 recommended including it). Confirm the inclusion before launch. | Nate | review |
| 10 | **"We've been through it" claims** (home page section 03). The copy says RampGuide "comes from a software company that holds a FedRAMP authorization of its own and has kept it current for years", that the engine "was written to generate our own submission" and "a real, assessed program has been through the importer", and that onboarding is done by "the same people who maintain our own package". The company, product, impact level, and year are deliberately unnamed (no-customer-names rule). Nate decides whether to name them and confirms each sentence is true as written. | Nate | review |
| 11 | **The Complete call.** A purchase creates the trust center and invites the owner by itself, and the pages say so ("minutes after you pay"). On Complete the pricing page and `welcome.html` also promise a time for the onboarding call within one business day: someone has to watch the Stripe dashboard (or its email on each payment) for Complete purchases and write to the owner. | Nate | open |

## Steps: test mode

Everything runs with no Stripe account at all (the app's dev server
simulates Stripe at the seam), or against a real Stripe **test-mode**
account.

**No account, on your machine:**

```bash
# terminal 1: the app, Stripe simulated (the Code tab's rampguide-app-dev is the same)
cd rampguide-trust && npm run dev

# terminal 2: the site
cd rampguide-site && python3 -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/pricing.html → fill the organization, the
offering, the owner's name and work email → Continue to checkout → the
simulated Stripe page (its banner says so) → Pay → `welcome.html` says the
trust center is on its way. The app has created it (its id is the
company's name, `acme` for "ACME Corp") and the owner's invitation code
is in `rampguide-trust/.local/mail.log`; `/enroll` with it opens setup.

**With a real Stripe test-mode account:** `rampguide-trust/OPERATIONS.md`,
"Buying", steps 1 to 4 (the two products and prices, the webhook endpoint
`https://trust.rampguide.com/v1/stripe/webhook` and its three events, the
deploy with the test values, the test card `4242 4242 4242 4242`). Nate
runs the deploy. For a local app instead, set the same `STRIPE_*`
variables before `npm run dev` and forward the events with
`stripe listen --forward-to localhost:8790/v1/stripe/webhook`.

## Steps: flipping to live (after every gate above)

1. In Stripe, leave test mode. Recreate the two products and prices and
   the coupon in live mode (test and live catalogs are separate). Add the
   live webhook endpoint (same URL, same three events) and copy its live
   `whsec_…`. Settings → Public details: business name (the entity from
   gate 1), support email (gate 5), terms URL (gate 4). Settings →
   Emails: turn on customer receipts for successful payments.
2. Deploy the app with the live values: the command in
   `rampguide-trust/OPERATIONS.md` "Buying" with `sk_live_…` and the live
   price, coupon and webhook values.
3. Smoke test in live mode with a real card for the smallest amount
   you're willing to refund, or rely on the test-mode pass: the code path
   is identical, only the credentials differ.
4. Once the site's checkout branch is on `main` (gate 8), check
   https://rampguide.com/pricing.html renders and each form's `action` is
   `https://trust.rampguide.com/v1/checkout`.
5. Watch the app's log (CloudWatch `/aws/lambda/rampguide-trust-api`) for
   the first `checkout-started` and `tenant-created` by `tool:checkout`.
   `node tools/tenants.ts` in rampguide-trust lists the trust centers,
   each bought one with its plan.

## What stays manual, by design

- On Complete: a time for the onboarding call within one business day.
- Ending the founding offer: `STRIPE_FOUNDING_COUPON= bash tools/deploy.sh`
  in rampguide-trust (an empty setting clears it).
- A trust center for a sale made another way (a purchase order, a design
  partner): `rampguide-trust/tools/make-tenant.ts`.
- A customer who leaves: cancel in Stripe's dashboard; the app records
  the end on the trust center and removes nothing. Keeping, exporting or
  purging it is a person's decision (`rampguide-trust/OPERATIONS.md`).
- Refunds, invoicing, purchase orders, multi-offering deals: Stripe
  dashboard and email.
