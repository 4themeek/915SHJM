# The Sacred Hearts — Next.js Website

A complete e-commerce website for The Sacred Hearts ministry, built with Next.js 15, TypeScript, @vercel/postgres (Neon), Stripe, and Shippo.

> **See [PROJECT_STATUS.md](PROJECT_STATUS.md) for current project state** — what's live, what's broken, and what's next. This README is a general orientation guide; PROJECT_STATUS.md is the up-to-date working notes.

**What's actually in the app today** (this section corrects some now-outdated claims further down in this file):
- Products live in a **Postgres database**, managed through an admin panel at `/admin` (magic-link email login) — not directly in `src/lib/products.ts`. That file is fallback/seed data only, used if the database is unreachable.
- Full **order tracking system**: a Stripe webhook saves paid orders, and `/admin/orders` lets you purchase and void Shippo shipping labels.
- Admin magic-link login emails are already wired up (Resend). The **contact form is not** — see the Contact Form section below, and PROJECT_STATUS.md.

---

## 🚀 Deploy to Vercel in 5 Steps

### Step 1 — Get the files onto GitHub
1. Create a free account at [github.com](https://github.com) if you don't have one
2. Create a new repository called `sacred-hearts`
3. Upload all these files to the repository (drag and drop the folder)

### Step 2 — Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **"Add New Project"**
3. Select your `sacred-hearts` repository
4. Click **Deploy** — Vercel auto-detects Next.js

### Step 3 — Add your logo
1. Name your logo file exactly: `logo.png`
2. Put it in the `public/` folder
3. The site will display it automatically in the hero and footer

### Step 4 — Add environment variables (to go live)
See [`.env.example`](.env.example) for the full list with explanations — Stripe, Shippo, admin login, Brevo (login emails), and Postgres are all required for the site to fully work. Set these in Vercel project dashboard → Settings → Environment Variables.

> For testing Stripe first, use `pk_test_...` and `sk_test_...` keys instead of live ones.

### Step 5 — Point your domain
In Vercel → Settings → Domains, add `thesacredhearts.org` and follow the DNS instructions.

---

## 📝 Making Updates

### Update product prices, descriptions, or images
Do this through the admin panel at `/admin` (magic-link login) → click a product → edit → Save. Products live in the Postgres database, **not** in `src/lib/products.ts` — that file is only a fallback used if the database is unreachable, and editing it won't change the live site.

### Add a new product
Use `/admin` → "+ Add New Product". (You can also add a matching entry to `src/lib/products.ts` if you want it available as fallback data too, but it's optional.)

### Change site colors
Edit `src/styles/globals.css` — all colors are CSS variables at the top:
- `--gold` — the gold accent color
- `--crimson` — the red/crimson color  
- `--navy` — the dark navy color
- `--cream` — the background color

### Update contact info, address, phone
Search the project for `513.741.3400` or `Moeller Avenue` to find all instances.

### Feature different products on the homepage
In `src/lib/products.ts`, update the `FEATURED_IDS` array with the IDs of products you want featured.

---

## 💳 Stripe Setup (Required for Live Payments)

1. Create/log in to your account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy your **Publishable key** and **Secret key**
4. Add them to Vercel environment variables (Step 4 above)
5. Redeploy

> The checkout is already wired up in `src/app/api/checkout/route.ts`.
> Once your keys are added, payments will work immediately.

### Size Variants & Exact Pricing
Currently products show starting prices. To add exact per-size pricing:
- In `src/lib/products.ts`, add a `variants` array to each product
- Update `src/app/shop/[id]/page.tsx` to display a size selector
- Update `src/app/api/checkout/route.ts` to use the selected variant price

---

## 📧 Contact Form — ⚠ currently non-functional

**Important:** `src/app/contact/ContactForm.tsx` currently does nothing but show a fake "Sending…" spinner and then "Message Sent!" — it never actually sends the message anywhere (`handleSubmit` has a `// TODO: connect to email service` and just fakes success after a timeout). Visitors submitting this form believe they've reached you, but nothing happens. This should be fixed before relying on it. Options:

**Easiest: Formspree** (free tier, no code needed)
1. Sign up at [formspree.io](https://formspree.io)
2. Create a form and get your form ID
3. In `src/app/contact/ContactForm.tsx`, replace the `handleSubmit` function with a fetch to `https://formspree.io/f/YOUR_FORM_ID`

**Developer option: Resend or SendGrid** — both have Next.js guides online.

---

## 📁 Project Structure

```
915SHJM/
├── public/
│   ├── logo.png
│   └── images/products/         ← Product images (local static files)
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx          ← Shop listing (reads DB via ShopClient)
│   │   │   └── [id]/page.tsx     ← Product detail
│   │   ├── admin/                ← Admin panel (magic-link login at /admin)
│   │   │   ├── dashboard/        ← Product management
│   │   │   ├── orders/           ← Order tracking + Shippo labels
│   │   │   ├── settings/         ← Promo codes, sale dates
│   │   │   └── products/[id]/    ← Edit/add product form
│   │   ├── api/
│   │   │   ├── checkout/route.ts         ← Stripe Checkout session
│   │   │   ├── webhooks/stripe/route.ts  ← Saves paid orders to DB
│   │   │   ├── shipping-rates/route.ts   ← Shippo rate quotes
│   │   │   ├── donate/route.ts
│   │   │   └── admin/                    ← Session-gated CRUD + orders/labels
│   │   ├── about/, contact/, donate/, faq/, shipping/, order-success/
│   │   ├── promises/, immaculate-heart/, holy-spirit/  ← Devotional content pages
│   │   └── checkout/CheckoutClient.tsx
│   ├── components/
│   │   ├── Navbar.tsx, Footer.tsx, ProductCard.tsx, CartDrawer.tsx
│   ├── lib/
│   │   ├── db.ts              ← All Postgres queries (products, orders, promos, settings)
│   │   ├── products.ts        ← Fallback/seed data ONLY, not the live source of truth
│   │   ├── auth.ts            ← Admin session + magic-link logic
│   │   └── cart-context.tsx   ← Shopping cart logic
│   └── styles/globals.css     ← Colors & design system (CSS variables)
├── .env.example                ← Copy to .env.local for local dev; see for full var list
├── PROJECT_STATUS.md            ← Current state, known bugs, next steps — read this first
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 🛠 Local Development

```bash
# Install Node.js from nodejs.org first, then:
npm install
cp .env.example .env.local
# Fill in real values in .env.local — see .env.example for what each one is for
npm run dev
# Open http://localhost:3000
```

Note: if `POSTGRES_URL` isn't set (or can't connect), the site automatically falls back to the static seed data in `src/lib/products.ts` — fine for UI-only work, but any admin panel / order / database feature needs a real, working Postgres connection.

---

## 📞 Need Help?

Contact The Sacred Hearts: info@thesacredhearts.org · 513.741.3400
