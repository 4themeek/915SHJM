# Sacred Hearts — Order & Shipping Label System — Project Status

**Last updated:** July 21, 2026
**Repo:** github.com/4themeek/915SHJM

---

## Where things stand

The site had product management and Stripe checkout working, but **no order tracking system existed** — when a customer paid, Stripe had the order but the app's database never found out, and the admin panel had no way to see orders or print shipping labels.

This update adds:
- An `orders` table in the Postgres database
- A Stripe webhook that saves each paid order (customer info, shipping address, line items)
- An admin **Orders** page (`/admin/orders`) with a "Create Label" button per order
- A "Void / Refund" button for cancelling a label before it's used
- Shippo integration for purchasing labels and printing them (PDF) with tracking numbers

## Files changed/added (already delivered)

**Edited:**
- `src/lib/db.ts` — added `orders` table schema + CRUD functions
- `src/app/api/checkout/route.ts` — now passes full shipping address + weight into Stripe metadata (previously only passed a formatted string, which wasn't enough to purchase a label later)
- `src/app/admin/dashboard/AdminDashboardClient.tsx` — added "📦 Orders" nav link

**New:**
- `src/app/api/webhooks/stripe/route.ts` — listens for `checkout.session.completed`, saves the order
- `src/app/api/admin/orders/[id]/create-label/route.ts` — purchases the Shippo label
- `src/app/api/admin/orders/[id]/void-label/route.ts` — requests a Shippo refund on an unused label
- `src/app/admin/orders/page.tsx` — server component, loads orders
- `src/app/admin/orders/OrdersClient.tsx` — the admin table UI with the buttons

All of this was delivered as `sacred-hearts-order-label-update.zip` — check if it's already been merged into the repo. If `src/app/admin/orders/page.tsx` exists in the repo, it's merged.

## Status: NOT YET LIVE — config steps still needed

The code will not work until these are done. **Do these next:**

1. **Push the zip's files** into the repo (via GitHub Desktop drag-merge, or GitHub web UI pencil-icon edits) if not already done.
2. **Vercel → Settings → Environment Variables:**
   - Confirm `SHIPPO_API_KEY` is set to your **live** Shippo token. (The existing `shipping-rates/route.ts` has a hardcoded test-token fallback — fine for rate quotes, but label purchases need the live key or they'll fail/use test mode.)
3. **Stripe Dashboard → Developers → Webhooks → Add endpoint:**
   - URL: `https://[your-live-domain]/api/webhooks/stripe`
   - Event to send: `checkout.session.completed`
   - Copy the **Signing secret** (starts with `whsec_`)
4. **Vercel → Environment Variables:** add `STRIPE_WEBHOOK_SECRET` = that signing secret.
5. **Redeploy** (Vercel usually auto-redeploys on env var save; trigger manually if not).
6. **Test:** place a real order or a Stripe test-mode order, then check `/admin/orders` — it should appear with status "paid." Click "Create Label" and confirm a real Shippo label + tracking number comes back.

## Known limitations / things to revisit later

- **No return-label flow yet.** Voiding only works for labels that were never used (pre-shipment cancellation). A customer return after shipping needs a separate outbound-label-with-swapped-addresses flow — not built yet.
- **No email notification to the customer when a label is created.** Currently the admin has to manually let the customer know their tracking number. Could wire into Brevo (already used elsewhere in the ecosystem, e.g. LakeDay) to auto-send tracking info.
- **Refund status is not polled automatically.** Shippo refunds resolve async (PENDING → SUCCESS/REJECTED over hours/days). A Shippo `transaction_updated` webhook was drafted in conversation but not yet added to this repo — currently you'd have to manually recheck.
- **Parcel dimensions are hardcoded** (12x10x3 in) in `create-label/route.ts`. Fine for most Sacred Hearts products, but revisit if you start shipping something oddly shaped/sized.
- **Rate object expiration:** Shippo rate IDs expire after some days. The create-label route already retries with a freshly requested rate if the saved one fails, so this should self-heal, but worth knowing about if labels ever fail unexpectedly.

## Quick architecture reference

```
Customer checkout (CheckoutClient.tsx)
   → /api/shipping-rates (get live rates from Shippo)
   → /api/checkout (create Stripe Checkout Session, store address+weight in metadata)
   → Stripe Checkout (customer pays)
   → /api/webhooks/stripe (checkout.session.completed → saves order to Postgres)

Admin (/admin/orders)
   → "Create Label" → /api/admin/orders/[id]/create-label → Shippo /transactions/ → label_url + tracking saved
   → "Void / Refund" → /api/admin/orders/[id]/void-label → Shippo /refunds/ → refund_status saved
```

Money flow reminder: **Stripe collects from the customer. Shippo bills your own card on file for the label cost.** These are two separate transactions — nothing links them automatically beyond your shipping fee needing to roughly cover what Shippo charges you.

## To resume this conversation with Claude later

Just reference this file and say something like: *"Picking back up on the Sacred Hearts order/label system — here's where PROJECT_STATUS.md says we left off."* Paste the file or its contents in, and mention which of the "next steps" above are already done.
