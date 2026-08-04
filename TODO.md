# Sacred Hearts (915SHJM) — To Do

Actionable, outstanding items only. For full context, architecture, and "why" on any of these, see [PROJECT_STATUS.md](PROJECT_STATUS.md).

---

## Order tracking system — config steps (code is merged, not yet live)

- [ ] Confirm `SHIPPO_API_KEY` in Vercel is the **live** Shippo token, not a test key
- [ ] Register a Stripe webhook: Stripe Dashboard → Developers → Webhooks → Add endpoint → `https://www.thesacredhearts.org/api/webhooks/stripe` → event `checkout.session.completed` → copy the signing secret
- [ ] Add that signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel → Environment Variables
- [ ] Redeploy, then place a real or Stripe test-mode order and confirm it appears in `/admin/orders`, and that "Create Label" returns a real Shippo label + tracking number

## Future feature ideas

- [ ] **Homepage background slideshow.** Full-page cinematic background with a slow zoom/fade between 7 images (`slide-01.jpg` through `slide-07.jpg`, 1920×1080px, to be uploaded). Build as a React component (not a video file) so text/buttons can overlay on top. Slow crossfade transition with a gentle Ken Burns zoom effect on each image. Sits behind all page content as a fixed layer. *(Brought over from notes in an earlier session — this replaces the earlier vague "opening intro" placeholder with the real spec.)*

## Stripe checkout — needs live verification

- [x] **Stripe checkout — CONFIRMED WORKING live.** User tested a real checkout end-to-end and it completed successfully. The image-URL fix (relative → absolute before sending to Stripe) was the actual root cause.
- [x] **Promo codes — DONE, site-side, not Stripe-side.** Finished wiring up the site's own custom promo-code system instead of using Stripe's native promo codes (removed `allow_promotion_codes: true`). The checkout Review step now has a real input/Apply field, `/api/checkout` re-validates server-side and applies the discount via a one-time Stripe coupon before the session is created (so Stripe only ever sees the already-discounted total), and usage counts increment only on completed payment. To create a working code, use `/admin/settings` — codes created directly in the Stripe Dashboard will **not** work anymore.
- [x] **Per-code "include shipping" toggle — DONE.** User tested a real $5-off code and found it only discounted the $1.25 product price, leaving shipping untouched — this was the original design (fixed-dollar discounts capped at product subtotal only). Added a per-code `applies_to_shipping` checkbox at `/admin/settings` so each code can opt into discounting the full order total instead. Also fixed a related inconsistency: percent-type codes were secretly already reaching shipping (Stripe's native `percent_off` applies to the whole session total regardless of intent) while fixed-dollar codes weren't — both now compute the exact dollar discount server-side for consistent behavior.
- [ ] **Test the new shipping-inclusive toggle on a real checkout.** Not yet verified live — create a code at `/admin/settings` with "Also apply this discount to shipping cost" checked, confirm it actually reduces shipping too at checkout.
- [ ] **Nested `<a>` hydration bug on Parish Display.** `ProductCard.tsx` wraps the whole card in a `<Link>`; for free/contact-us items (like "Parish Display") it also renders a `<Link href="/contact">` inside that same card, producing an invalid nested `<a>` and a React hydration warning. Spotted while testing checkout, not yet fixed.

## Bugs / technical debt

- [ ] **Contact form doesn't send anything.** `src/app/contact/ContactForm.tsx` fakes a "Message Sent!" success after a timeout — nothing is actually emailed anywhere. `RESEND_API_KEY` is already set in Vercel but nothing in the codebase calls it.
- [ ] **Vercel Blob store is Private, but the upload code requests public access.** `src/app/api/admin/upload/route.ts` calls `put(..., { access: 'public' })` against a store configured as Private — the admin panel's "upload image" button will fail if anyone uses it. Either switch the store to public access, or rework the upload flow for signed URLs.
- [ ] **Double-dollar-sign price bug.** At least "Sacred Heart of Jesus – Classic Plaques (Spanish)" shows `$$ 3.00` instead of `$3.00` in its price display — check that product's `price` field in the admin panel.
- [ ] **Remove leftover debug logging.** `console.log` calls dumping full product payloads on every save, in `src/app/admin/ProductForm.tsx` and `src/app/api/admin/products/[id]/route.ts`.
- [ ] **`runMigrations()` runs on every product save.** Two `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements in the products PUT route — harmless (idempotent) but only ever needs to run once, not every save.
- [ ] **Upgrade `next@15.3.6`.** Known high-severity security vulnerability per `npm install`'s own warning.
- [ ] **Audit git history for anything sensitive.** No `.gitignore` existed in this repo until this project — worth a check that nothing large or sensitive got committed before it did.
