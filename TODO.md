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
- [x] **Free-shipping display/scope bugs — DONE.** Sidebar Order Summary wasn't reflecting the $50-threshold free-shipping override (checked the wrong variable). Also, hitting the threshold zeroed out *whatever* rate was selected, including expensive expedited options — now only the cheapest available rate is free; upgrades cost the difference.
- [x] **Shipping cost hardened server-side — DONE.** `/api/checkout` no longer trusts the client's claimed shipping amount: it independently re-fetches live Shippo rates for the address, rejects a claimed rate that doesn't match a fresh quote, and re-verifies the "all items on sale = free shipping" perk against the database instead of the client's say-so.
- [x] **Donate page "Something went wrong" — DONE.** Same root cause as the original checkout bug (deprecated `redirectToCheckout` pattern instead of using `session.url`). Fixed identically to checkout.
- [ ] **Nested `<a>` hydration bug on Parish Display.** `ProductCard.tsx` wraps the whole card in a `<Link>`; for free/contact-us items (like "Parish Display") it also renders a `<Link href="/contact">` inside that same card, producing an invalid nested `<a>` and a React hydration warning. Spotted while testing checkout, not yet fixed.
- [ ] **Product prices aren't re-validated server-side.** `/api/checkout` trusts `item.startPrice` from the client for line-item pricing, same class of gap as the shipping-cost issue just fixed but not yet addressed — a tampered request could currently claim an arbitrary price. Worth hardening the same way (look up the real price from the DB by product id) when there's time.

## Bugs / technical debt

- [x] **Product detail page CSS was broken sitewide — DONE.** `product.module.css` was missing every class `shop/[id]/page.tsx` actually references (`.imageWrap`, `.productPage`, `.category`, `.saleBadge`, `.oosBadge`, `.contactBtn`, `.metaInfo`, `.relatedTitle`, etc.) — only had old, differently-named leftover classes. Without `.imageWrap`'s `position: relative`, the product image had no container to size against and rendered unconstrained ("oversized"). Added the missing classes to match the site's existing badge/button styling. Affected every product page, discovered via the new FAQ → Enthronement Booklet link.
- [ ] **29 of 37 product images are only 300×300px source files.** Recovered from an old WordPress backup as low-res thumbnails — will look soft/blurry at normal display sizes even with the CSS fix above, since that's a source-resolution limit, not a layout bug. Only 8 products (e.g. Sacred Heart Badges) have proper high-res (1200×1200) sources. Needs better original images sourced for the other 29 if sharper product photos are wanted.
- [x] **Contact form — DONE.** Was faking a "Message Sent!" success after a timeout with no real inputs. Now saves to a `contact_messages` table, emails a notification to 4thesacredhearts@gmail.com via Brevo (Reply-To set to the sender), and lists submissions at `/admin/messages` (mark read/unread, delete) — reachable via a "✉ Messages" button in the admin nav. `RESEND_API_KEY` is still unused/set in Vercel but no longer needed for this.
- [ ] **Vercel Blob store is Private, but the upload code requests public access.** `src/app/api/admin/upload/route.ts` calls `put(..., { access: 'public' })` against a store configured as Private — the admin panel's "upload image" button will fail if anyone uses it. Either switch the store to public access, or rework the upload flow for signed URLs.
- [ ] **Double-dollar-sign price bug.** At least "Sacred Heart of Jesus – Classic Plaques (Spanish)" shows `$$ 3.00` instead of `$3.00` in its price display — check that product's `price` field in the admin panel.
- [ ] **Remove leftover debug logging.** `console.log` calls dumping full product payloads on every save, in `src/app/admin/ProductForm.tsx` and `src/app/api/admin/products/[id]/route.ts`.
- [ ] **`runMigrations()` runs on every product save.** Two `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements in the products PUT route — harmless (idempotent) but only ever needs to run once, not every save.
- [ ] **Upgrade `next@15.3.6`.** Known high-severity security vulnerability per `npm install`'s own warning.
- [ ] **Audit git history for anything sensitive.** No `.gitignore` existed in this repo until this project — worth a check that nothing large or sensitive got committed before it did.
