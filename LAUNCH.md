# LAUNCH.md — contact onboarding and future paid checkout

## Current offer

One plan: **$3,000 per company per year**, including all current features,
supported programs and the company’s own packages, unlimited team members and
invited readers, one 60-minute guided onboarding session, and email support
with a target initial response within two business days. Assessments and ongoing
consulting remain separate. Packages retain separate scope, access and publication;
they are not billing units.

The legal seller is **Spider Strategies, Inc.** The approved contact for support,
billing and privacy is **nathan@spiderstrategies.com**. The website starts with
“Contact us to get started.” There are no payment forms.

**Stripe setup and payment testing are paused at Nate’s request.** Do not create
an account, configure prices, enable checkout or run remote payment tests until
he resumes that work. The app retains a legacy two-plan checkout integration and
local simulation; those are not the current commercial offer.

## Approved policies awaiting implementation

- First annual subscription: 30-day money-back guarantee. No prorated refunds
  for ordinary cancellations after that window.
- Automatic annual renewal, with an email reminder 30 days beforehand.
  Cancellation stops the next renewal and retains access through the paid year.
- After paid access ends: 30 days of read-only export access, then deletion of
  the active workspace. Remove remaining customer-content backups within
  35 days after deletion, at most 65 days after paid access ends.
- Access/security logs: 400 days, excluding document contents and secrets.
- Invoices/payment records: Spider Strategies’ existing accounting retention
  policy. Its actual duration remains unverified; do not invent a deadline.

These decisions do not make the corresponding application behavior implemented.
Keep `terms.html` and `privacy.html` marked as drafts, noindex and unlinked until
accurate legal text and the promised behavior are ready. Do not publish renewal,
retention or deletion promises ahead of implementation.

## Gates before enabling paid checkout

1. Obtain approval to resume Stripe work. Use one annual company price, remove
   the legacy Complete purchase option and reconcile checkout and simulator copy.
2. Implement and verify renewal reminders, cancellation, the export window,
   active-data deletion and backup expiry. Define refund operations and verify
   accounting retention. Check that logs actually follow the approved policy.
3. Finalize terms/privacy, effective dates and remaining legal details. Align
   Stripe’s legal entity, receipts, support details and approved terms link.
4. Complete real Stripe test-mode payment, signed webhook fulfillment,
   invitation delivery and passkey enrollment. Local simulation proves only
   the local path. Never use a real card for an unattended smoke test.
5. Obtain explicit approval for production payment activation.

## Preview and release

Follow `README.md` for isolated local previews. Run `node --test test/*.test.*`
and `node tools/build.ts --check`; review the actual desktop and phone pages.
Inspect contact links without sending email.

Pushing site `main` deploys GitHub Pages. Obtain Nate’s explicit deployment
approval; preparing and verifying local changes alone does not authorize a push.
