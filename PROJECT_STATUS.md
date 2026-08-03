# Sacred Hearts (915SHJM) — Project Status

**Last updated:** August 2, 2026
**Repo:** github.com/4themeek/915SHJM (main branch, auto-deploys to Vercel)
**Live site:** https://www.thesacredhearts.org
**Stack:** Next.js 15, @vercel/postgres (Neon-backed), Stripe, Shippo, Vercel Blob (unused/private — see below)

---

## How to resume this project with Claude later

Paste this file's contents in, or just say *"Picking back up on Sacred Hearts — check PROJECT_STATUS.md."* It covers what's done, what's broken, and what's next.

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

---

## 6. Traffic / analytics hardening (shipped this session)

- **Statcounter analytics** added site-wide via `next/script` in the root layout (`src/app/layout.tsx`), so it loads on every page including client-side navigations.
- **Bot-probe traffic blocked at the edge:** the site was getting massive automated WordPress-vulnerability-scanner traffic (millions of requests/day) against `/wp-content/*`, `/wp-admin/*`, `/wp-login.php`, `/xmlrpc.php`, `/.env` — none of which are real routes in this Next.js app. Added `src/middleware.ts` to return an immediate 404 for those exact paths before they reach the rest of the app. Note: `middleware.ts` must live inside `src/` for this project (it uses the `src/` directory convention) — putting it at the project root silently does nothing, which is a mistake worth remembering if this ever needs editing.
  - Considered a `vercel.json` redirects entry first, but Vercel's `redirects` only supports status codes 301/302/303/307/308 — `404` isn't valid there and would have failed deployment. Middleware was the correct, safe mechanism instead.
  - Worth periodically checking Vercel's traffic/Firewall logs to confirm this actually reduced the bot noise, since Vercel's Firewall may already be intercepting some of this traffic even earlier in the pipeline (see the wp-content firewall note in section 2).

---

## Quick reference

- **Admin panel:** `/admin` (magic-link email login, `ADMIN_EMAIL` env var controls who can log in)
- **Products:** stored in Postgres `products` table; `src/lib/products.ts` is fallback/seed data only (used if the DB is unreachable), not the live source of truth
- **Local dev without DB access:** `npm run dev` still works and falls back to the static seed data in `products.ts` if Postgres can't connect — useful for UI-only testing
