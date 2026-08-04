# Sacred Hearts (915SHJM) — Project Status

**Last updated:** August 3, 2026
**Repo:** github.com/4themeek/915SHJM (main branch, auto-deploys to Vercel)
**Live site:** https://www.thesacredhearts.org
**Stack:** Next.js 15, @vercel/postgres (Neon-backed), Stripe, Shippo, Vercel Blob (unused/private — see below)

---

## How to resume this project with Claude later

Paste this file's contents in, or just say *"Picking back up on Sacred Hearts — check PROJECT_STATUS.md."* It covers what's done, what's broken, and what's next.

**For a fast-scan checklist of outstanding work only** (no narrative context), see [TODO.md](TODO.md). Keep the two in sync — TODO.md pulls its items from the "config steps" and "known bugs" sections below.

**Local clone:** `C:\2026-Claude\SacredHearts`. Vercel CLI is installed and linked (`vercel link` → `amdg26/915-shjm`) — `vercel env pull .env.local` works for most env vars, but see the "Sensitive env vars" gotcha below before assuming a local script can hit the database.

---

## 1. Order tracking + Shippo label system — merged, NOT YET LIVE

Adds an `orders` table, a Stripe webhook that saves paid orders, and an admin `/admin/orders` page with "Create Label" / "Void / Refund" buttons (Shippo integration). Code is merged into main. **Still needs these config steps before it will work:**

1. **Vercel → Settings → Environment Variables:** confirm `SHIPPO_API_KEY` is your **live** Shippo token, not a test key.
2. **Stripe Dashboard → Developers → Webhooks → Add endpoint:**
   URL: `https://www.thesacredhearts.org/api/webhooks/stripe`, event: `checkout.session.completed`. Copy the signing secret (`whsec_...`).
3. **Vercel → Environment Variables:** add `STRIPE_WEBHOOK_SECRET` = that signing secret.
4. Redeploy, then place a real or Stripe test-mode order and confirm it shows up in `/admin/orders`, and that "Create Label" returns a real Shippo label + tracking number.

**Known limitations (by design, revisit later if needed):**
- No return-label flow (voiding only works pre-shipment).
- No customer email notification when a label is created — admin has to tell them manually.
- Shippo refund status isn't polled automatically (resolves async over hours/days; would need a Shippo `transaction_updated` webhook, not built).
- Parcel dimensions are hardcoded (12×10×3 in) in `create-label/route.ts`.

Architecture:
```
Checkout (CheckoutClient.tsx) → /api/shipping-rates → /api/checkout (Stripe session)
   → Stripe Checkout → /api/webhooks/stripe (checkout.session.completed → saves order)

Admin /admin/orders → Create Label → Shippo /transactions/ → label_url + tracking saved
                    → Void/Refund  → Shippo /refunds/ → refund_status saved
```
Stripe collects from the customer; Shippo bills your own card on file for the label. Two separate transactions.

---

## 2. Product images — FULLY RESOLVED

**What happened:** an admin bulk price-editing session (37 products, one at a time) wiped the `img` field to an empty string on 36 of 37 products. Root cause: [ImageUploader.tsx](src/app/admin/ImageUploader.tsx) used to call `onUpload('')` whenever its preview thumbnail failed to load — and every preview *was* failing, because the images were hosted at `thesacredhearts.org/wp-content/uploads/...`, and Vercel's Firewall has a default managed rule that challenges/blocks any request matching WordPress attack-surface paths (`/wp-content/`, `/wp-admin/`, etc.) — independent of the separate "Attack Challenge Mode" toggle. So every product the admin saved during that session got its real image URL silently deleted.

**Fixed:** ImageUploader no longer wipes the saved value on a preview failure — it now just shows "Preview unavailable" while keeping the real URL intact.

**Recovered: all 37 of 37 products** now have working images, verified live on the site:
- 29 from a Feb 19, 2026 WordPress `/wp-content/uploads/` backup (`backup_2026-02-19-1947_The_Sacred_Hearts_..._uploads.zip` in the user's Downloads).
- 7 whose images were uploaded to WordPress *after* that backup (so weren't in it) — supplied directly by the site owner from their own phone/photo backup, matched by content to products 9, 10, 13, 14, 15, 16, 17.
- "Parish Display" (id 33) — was never wiped by the data-loss bug, but still pointed at the blocked wp-content URL; its file was also in the Feb 19 backup.

All images live at `public/images/products/product-{id}.{ext}` as local static files, which sidesteps the wp-content firewall issue entirely going forward. Nothing outstanding here.

---

## 3. Known bugs / technical debt (not yet fixed, spotted along the way)

- **Contact form doesn't actually send anything.** [`ContactForm.tsx`](src/app/contact/ContactForm.tsx) shows a fake "Sending…" spinner and then "Message Sent!" — `handleSubmit` has a `// TODO: connect to email service` and just fakes success after a `setTimeout`. Visitors believe their message reached the business; it goes nowhere. Worth fixing soon — `RESEND_API_KEY` is already set in Vercel but nothing in the codebase calls it, so it may have been intended for exactly this and never finished.
- **Vercel Blob store is misconfigured for the admin upload feature.** The connected Blob store (`sacred-hearts-images`, `store_6nL0qIEiAuCuSSwV`) is set to **Private** access, but [`/api/admin/upload/route.ts`](src/app/api/admin/upload/route.ts) calls `put(..., { access: 'public' })`. If anyone uses the "upload image" button in the admin product form right now, it will fail. Either switch the store to public access in the Vercel dashboard, or rework the upload flow to use signed URLs for private blobs (bigger change). Given the images work fine now as static files under `public/images/`, you may not need Blob storage at all going forward.
- **Double-dollar-sign price bug:** at least one product ("Sacred Heart of Jesus – Classic Plaques (Spanish)") shows `$$ 3.00` instead of `$3.00` in its `price` display string — likely a data-entry artifact from the bulk price-edit session. Not investigated further; worth a quick look at that product's `price` field in the admin panel.
- **Debug logging left in:** [ProductForm.tsx](src/app/admin/ProductForm.tsx) and [products/[id]/route.ts](src/app/api/admin/products/[id]/route.ts) have leftover `console.log` calls dumping full product payloads on every save. Harmless but noisy in Vercel logs.
- **`runMigrations()` runs on every single product save** (two `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements) in the products PUT route — idempotent so harmless, but only ever needs to run once.
- **`next@15.3.6` has a known high-severity security vulnerability** per `npm install`'s own warning. Worth upgrading when there's time to test against a newer version.
- **No `.gitignore` existed in this repo until this session.** One now exists (`.vercel`, `.env*`, `node_modules`, `.next`, `tsconfig.tsbuildinfo`) — but double check nothing large/sensitive was committed historically before this.

---

## 4. Infrastructure notes learned this session

- **Postgres env vars are marked "Sensitive" in Vercel** (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL`, `POSTGRES_PRISMA_URL`, etc., via the Neon integration). Sensitive vars are **write-only** — once marked sensitive, Vercel will never let you read the real value back, via CLI (`vercel env pull`) or dashboard, for anyone, ever. This means **no local script can get a working direct database connection.** Any future data migration/fix needs to happen either through the app's own admin-session-gated API routes (add a temporary one-off route, hit it once while logged into `/admin`, then delete it — this is the pattern used to recover all 36 images above), or by temporarily un-marking a variable as sensitive in the dashboard (not recommended without good reason).
- **Vercel CLI is installed and linked** on the user's machine (`C:\2026-Claude\SacredHearts` → `vercel link` → project `amdg26/915-shjm`). `vercel env pull .env.local` works for non-sensitive vars.
- **`.env.local` note:** if you (Claude) ever run `vercel env pull` from a sandboxed tool environment, a safety filter may scrub secret-shaped values to a placeholder before they hit disk — but per the Postgres discovery above, that turned out to be moot for the DB vars specifically, since they're unreadable by design regardless of who's asking.

---

## 5. UI/UX changes shipped this session (all live)

- Cart drawer: added a "Continue Shopping" button (both the populated-cart and empty-cart states) that closes the drawer and routes to `/shop`.
- Product prices bumped ~4pt larger and bold, on both the `/shop` grid tiles and individual `/shop/[id]` pages. Also added CSS for the sale-price/original-price display, which had no styling at all before (was rendering unstyled if a sale was active).
- `/promises` page: promise numbers recolored from faded 40%-opacity gold to solid crimson-light (a shade lighter than the section title's crimson). The Great Promise card now shows "12" (previously a ✦ star) above "The Great Promise" label, sized to match the other numbers +4pt, in a lighter rose-crimson for contrast against its dark gradient background. Bolded the key sentences about the Twelfth Promise and Good Friday under "The First Friday Devotion."
- `/faq` page: updated the "Do you offer free shipping?" answer to the current $50 threshold wording, noting it's subject to change.
- `/immaculate-heart` page: added a new "August: The Month of the Immaculate Heart of Mary" intro box near the top (dark navy/gold box matching the page's existing "Five First Saturdays" style), covering the August 22, 1944 feast day Pope Pius XII established during WWII and its later move to the Saturday after the Sacred Heart in June.
  - **Gotcha hit twice while building it:** the box's `<h2>`/`<p>` elements sit inside the page's global `.content-block` wrapper, whose global `.content-block h2` / `.content-block p` rules (dark navy/ink-soft text, meant for light backgrounds) have *higher CSS specificity* than a single CSS-Modules class selector — so they silently won and rendered dark text on the box's dark background, twice (first on the title/body text, then again on the "A Timely Devotion" eyebrow line I'd missed the first time). Fixed by scoping selectors under the box's own class (e.g. `.augustBox .augustTitle`) to raise specificity, plus brightened the colors (gold-light / white) for extra contrast margin. **Worth remembering:** any new highlighted/dark box nested inside a `.content-block` on this site needs its text selectors scoped this way from the start, not just a single class name.

---

## 6. Traffic / analytics hardening (shipped this session)

- **Statcounter analytics** added site-wide via `next/script` in the root layout (`src/app/layout.tsx`), so it loads on every page including client-side navigations.
- **Bot-probe traffic blocked at the edge:** the site was getting massive automated WordPress-vulnerability-scanner traffic (millions of requests/day) against `/wp-content/*`, `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php`, `/.env` — none of which are real routes in this Next.js app. Added `src/middleware.ts` to return an immediate 404 for those exact paths before they reach the rest of the app. Note: `middleware.ts` must live inside `src/` for this project (it uses the `src/` directory convention) — putting it at the project root silently does nothing, which is a mistake worth remembering if this ever needs editing.
  - Considered a `vercel.json` redirects entry first, but Vercel's `redirects` only supports status codes 301/302/303/307/308 — `404` isn't valid there and would have failed deployment. Middleware was the correct, safe mechanism instead.
  - Worth periodically checking Vercel's traffic/Firewall logs to confirm this actually reduced the bot noise, since Vercel's Firewall may already be intercepting some of this traffic even earlier in the pipeline (see the wp-content firewall note in section 2).

---

## 7. Shop Under Construction mode (shipped this session)

Admin-togglable mode that shows a read-only product catalog on the Shop pages and disables purchasing sitewide, while leaving the rest of the site (About, Promises, Donate, Contact, etc.) completely live. Useful for pausing orders during changes without taking the whole site down.

- **Toggle:** `/admin/settings` → "🚧 Shop Under Construction" section, with a status indicator and on/off button (confirms before turning on).
- **Storage:** a single settings-table key, `shop_maintenance_mode` (`'true'`/`'false'`), read via the existing `getSetting`/`setSetting` helpers in `src/lib/db.ts`.
- **How it's wired:** the flag is fetched once in the root layout (`src/app/layout.tsx`) and passed into `CartProvider` (`src/lib/cart-context.tsx`), which exposes it via `useCart().shopMaintenance` to any client component — that's how `ProductCard`, `AddToCartButton`, and `Navbar` react to it without prop drilling.
- **What it does when on:**
  - `/shop` shows a banner ("Shop Under Construction... call to order") above the normal product grid; every `ProductCard` shows a "Shop Under Construction" note instead of its Add to Cart / Contact / Out of Stock button.
  - `/shop/[id]` shows the same "call to order" note in place of the Add to Cart button.
  - The cart icon disappears from the navbar (desktop, mobile bar, and mobile menu) sitewide — including on the homepage's featured-products section, since it also uses `ProductCard`.
  - `/checkout` redirects to `/shop`, so a visitor who already had items in a cart from before the toggle was flipped can't complete a purchase.
- **Fails open:** if the `getSetting` call errors for any reason (e.g. a transient DB hiccup), it's treated as off — the shop stays fully functional rather than accidentally locking up.
- **Fixed:** the "Shop Under Construction" note in `ProductCard` sits inside the card's outer `<Link>` (the whole card is clickable), so it was inheriting navigation to the product page despite looking disabled. Now blocks the click (`preventDefault`/`stopPropagation`) and shows a `not-allowed` cursor, like the image wrapper already did. The rest of the card (image, name) still links through — browsing is still allowed, just not "buying." Confirmed the real Add to Cart button is unaffected when the mode is off.
- Note: an earlier version of this feature blocked the *entire* site via `src/middleware.ts` (a raw HTML 503 page at the edge). That approach was replaced by this narrower one at the user's request — if you ever see references to a full-site "Under Construction" HTML page in old context, that's superseded.

---

## 8. Stripe checkout investigation — fixes shipped, needs live test

**The bug:** clicking pay creates a Stripe Checkout Session successfully (confirmed via Vercel logs), but Stripe's own hosted checkout page then shows a generic "Something went wrong. You might be having a network connection problem, the link might be expired, or the payment provider cannot be reached." Reported via notes brought over from a separate session, which had already ruled out: empty `NEXT_PUBLIC_SITE_URL` (fixed, confirmed currently correct with no trailing slash), Stripe keys being live/matching, account restrictions, and browser-specific issues (fails identically in Firefox and Edge).

**Two fixes landed this session** (from two parallel sessions working on this — one pushed directly to GitHub mid-session, requiring a merge):
- **Product images passed to Stripe as unqualified relative paths.** `/api/checkout/route.ts` was passing `item.img` straight through to Stripe's `product_data.images`. Since this session's earlier work moved most product images to local relative paths (`/images/products/product-{id}.jpg`), those were reaching Stripe as invalid non-absolute URLs. Now converts to absolute (`item.img.startsWith('http') ? item.img : \`${siteUrl}${item.img}\``) before sending. **This is the strongest candidate for the actual root cause** — a malformed image URL wouldn't necessarily fail session *creation*, but could plausibly break rendering on Stripe's *hosted* page, matching the symptom exactly.
- **Switched the client-side redirect** from `stripe.redirectToCheckout({ sessionId })` (Stripe.js's older helper, requiring `@stripe/stripe-js` loaded client-side) to returning `session.url` from the server and doing `window.location.href = url` directly — Stripe's current recommended pattern, and removes one client-side round-trip to Stripe before the customer reaches the hosted page. Lower confidence this was the cause, but a genuine simplification regardless. `CheckoutClient.tsx` no longer imports `loadStripe`/`@stripe/stripe-js` at all.

**Not yet done — needs a real checkout test** to confirm these actually fixed it. If it still fails:
- Check Stripe Workbench → **Logs** (not Events) for the real current `success_url`/`cancel_url` on a fresh attempt.
- Test from a different network (e.g. phone on cellular data) to rule out a router/firewall/ad-blocker blocking Stripe's fraud-detection domain (`m.stripe.network`) — this fits the "fails identically in two different browsers" symptom better than a code bug would, since a network-level block would affect both browsers identically while a code bug already should have too, but this is the one hypothesis that was never actually tested.

**Also added:** `allow_promotion_codes: true` on the Checkout Session — Stripe's hosted page now shows its own promo code field automatically.

**Also discovered (not removed, needs a decision):** the site already has a *separate, custom-built* promo-code system — its own `promo_codes` Postgres table, an admin UI at `/admin/settings`, and `/api/validate-promo`. The checkout page's UI never had an actual input field wired in to use it (the state/logic exists in `CheckoutClient.tsx` but nothing renders it), and even if it had, `/api/checkout` never read the resulting `promoCode`/`promoDiscount` from the request — so the discount would never have actually reduced what Stripe charges. Two non-overlapping, non-functional promo systems existed side by side. Now that Stripe-native codes work, this custom system is redundant unless there's a reason to keep it (e.g. wanting codes manageable from this site's own admin panel instead of the Stripe Dashboard) — see TODO.md.

---

## Quick reference

- **Admin panel:** `/admin` (magic-link email login, `ADMIN_EMAIL` env var controls who can log in)
- **Products:** stored in Postgres `products` table; `src/lib/products.ts` is fallback/seed data only (used if the DB is unreachable), not the live source of truth
- **Local dev without DB access:** `npm run dev` still works and falls back to the static seed data in `products.ts` if Postgres can't connect — useful for UI-only testing
