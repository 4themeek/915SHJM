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

- [ ] **Test a real checkout end-to-end.** Customer clicks pay → Stripe session creates successfully (confirmed via Vercel logs) → but Stripe's *hosted* checkout page shows a generic "Something went wrong" error. Two fixes just landed that are strong candidates for the actual cause — needs a real test to confirm: (1) product images were being passed to Stripe as unqualified relative paths (e.g. `/images/products/product-9.jpg`) instead of absolute URLs — now fixed to prepend the site URL when needed; (2) switched the client redirect from the older `stripe.redirectToCheckout()` helper to Stripe's now-recommended `session.url` + `window.location.href` pattern, removing one client-side round-trip to Stripe. If it still fails after this, the next step is checking Stripe Workbench → Logs for the real current `success_url`/`cancel_url` on a fresh attempt, and testing from a different network (e.g. phone on cellular) to rule out a router/firewall blocking Stripe's fraud-detection domain (`m.stripe.network`) — that fits the symptom pattern (fails identically in Firefox and Edge) better than a code bug would.
- [ ] **Decide the fate of the unused custom promo-code system.** Separate from Stripe's native promo codes (now working via `allow_promotion_codes: true`), the site has its own `promo_codes` DB table, an admin UI to create codes at `/admin/settings`, and a `/api/validate-promo` endpoint — but the checkout page never had an input field wired in to actually use it, and even if it had, the discount was never read by `/api/checkout` so it wouldn't have reduced the Stripe charge anyway. Decide: keep it and finish wiring it up, or remove the dead code (unused promo state in `CheckoutClient.tsx`, and optionally the DB table/admin UI/route) now that Stripe's own promo codes cover this.
- [ ] **Nested `<a>` hydration bug on Parish Display.** `ProductCard.tsx` wraps the whole card in a `<Link>`; for free/contact-us items (like "Parish Display") it also renders a `<Link href="/contact">` inside that same card, producing an invalid nested `<a>` and a React hydration warning. Spotted while testing checkout, not yet fixed.

## Bugs / technical debt

- [ ] **Contact form doesn't send anything.** `src/app/contact/ContactForm.tsx` fakes a "Message Sent!" success after a timeout — nothing is actually emailed anywhere. `RESEND_API_KEY` is already set in Vercel but nothing in the codebase calls it.
- [ ] **Vercel Blob store is Private, but the upload code requests public access.** `src/app/api/admin/upload/route.ts` calls `put(..., { access: 'public' })` against a store configured as Private — the admin panel's "upload image" button will fail if anyone uses it. Either switch the store to public access, or rework the upload flow for signed URLs.
- [ ] **Double-dollar-sign price bug.** At least "Sacred Heart of Jesus – Classic Plaques (Spanish)" shows `$$ 3.00` instead of `$3.00` in its price display — check that product's `price` field in the admin panel.
- [ ] **Remove leftover debug logging.** `console.log` calls dumping full product payloads on every save, in `src/app/admin/ProductForm.tsx` and `src/app/api/admin/products/[id]/route.ts`.
- [ ] **`runMigrations()` runs on every product save.** Two `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements in the products PUT route — harmless (idempotent) but only ever needs to run once, not every save.
- [ ] **Upgrade `next@15.3.6`.** Known high-severity security vulnerability per `npm install`'s own warning.
- [ ] **Audit git history for anything sensitive.** No `.gitignore` existed in this repo until this project — worth a check that nothing large or sensitive got committed before it did.
