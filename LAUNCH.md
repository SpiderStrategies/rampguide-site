# LAUNCH.md — from local simulation to paid checkout

The site sells the hosted application, with the library and trust center
included. Each package covers one system under one program. Federal Risk
and Authorization Management Program (FedRAMP) and Cybersecurity Maturity
Model Certification (CMMC) work uses separate packages.

The pricing forms post to `https://trust.rampguide.com/v1/checkout` in
production. Stripe confirms payment through the app's verified webhook;
the app then creates the workspace and captures or sends the named owner's
invitation, according to its mail adapter. Without Stripe configuration,
online checkout is closed. A local simulation does not establish that live
payment, delivery of email, or contractual terms are ready.

## Release gates

- Confirm the legal entity on Stripe, receipts, service terms and privacy
  notice. The copyright entity is Spider Strategies, Inc.; that alone does
  not establish the Stripe account's legal entity.
- Approve the displayed annual prices: RampGuide $6,000 per package and
  Complete $15,000 per package. Keep source pages, app simulator labels and
  Stripe products/prices aligned. No automatic founding discount is promised;
  any offered discount must be configured and verified at checkout.
- Approve service, cancellation, refund and retention terms. `terms.html`
  and `privacy.html` are unapproved drafts, noindex and unlinked. Remove
  those draft markers and link the pages only after approval; set the approved
  terms URL in Stripe.
- Confirm the Complete onboarding scope and who schedules the session.
  The site does not promise a one-business-day response or delivery time.
- Confirm `nathan@spiderstrategies.com` remains the intended contact.
- Review current pages for claims about supported import/output formats,
  library scope and trust-center access. Do not revive removed automatic
  update, regulatory outcome, competitor-price or personal-history claims.
- Test real Stripe test-mode payment, signed webhook fulfillment, invitation
  delivery and the actual passkey ceremony before enabling paid checkout.
- Obtain Nate's explicit deployment approval. Pushing site `main` deploys
  GitHub Pages; local implementation and verification do not authorize a push.

## Local simulation

Follow `README.md` for matching site/app ports and an isolated state directory.
Start from the site homepage with `?trust=<local app origin>`, choose Pricing,
fill the organization, first system, owner name and fictional email, and
continue to the visibly simulated checkout. Select **Pay (simulated)**.

The welcome page explicitly says no card was charged and no receipt or
invitation email was sent. Open its captured-mail link, read the owner's
one-time invitation code, and follow its enrollment link. Complete the
passkey ceremony and set up the package. Captured mail is a local development
substitute, not evidence of delivery to a real inbox.

The simulation exercises the real checkout route, webhook signature verifier,
workspace creation and invitation logic. It does not test Stripe hosting,
card processing, receipts, real email delivery or subscription operations at
Stripe. In-flight simulated checkout sessions are memory-only and must be
restarted from Pricing after the app restarts.

Run the site regression checks and generated freshness check from `README.md`,
and the app's billing and local-handoff tests. Review the actual rendered
site and full onboarding at desktop and phone widths.

## Stripe test mode and live activation

Use the app's current `OPERATIONS.md` buying instructions for products,
recurring prices, webhook configuration and deployment. Any remote deployment
requires Nate's explicit approval. For local test-mode checkout, set only
Stripe test credentials and use Stripe CLI webhook forwarding to the selected
local app port. The local mail adapter still captures invitations.

After the release gates, Nate configures the live products, approved prices,
webhook secret, legal/support details and receipt settings and deploys the app.
Check the site's production form targets and observe checkout/fulfillment
logs without exposing credentials. Never use a real card as an unattended
smoke test. Refunds, invoicing, purchase orders, negotiated deals and final
data retention or removal remain explicit operational actions.
