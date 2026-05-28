# The Sacred Hearts — Next.js Website

A complete e-commerce website for The Sacred Hearts ministry, built with Next.js 14, TypeScript, and Stripe.

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

### Step 4 — Add Stripe keys (to go live)
In your Vercel project dashboard → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (from Stripe dashboard) |
| `STRIPE_SECRET_KEY` | `sk_live_...` (from Stripe dashboard) |
| `NEXT_PUBLIC_SITE_URL` | `https://www.thesacredhearts.org` |

> For testing first, use `pk_test_...` and `sk_test_...` keys instead.

### Step 5 — Point your domain
In Vercel → Settings → Domains, add `thesacredhearts.org` and follow the DNS instructions.

---

## 📝 Making Updates

### Update product prices or descriptions
Edit `src/lib/products.ts` — all 39 products are listed there with clear comments.

### Add a new product
In `src/lib/products.ts`, copy any existing product block and update the fields. Increment the `id` number.

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

## 📧 Contact Form

The contact form is ready but needs an email service to actually send messages. Options:

**Easiest: Formspree** (free tier, no code needed)
1. Sign up at [formspree.io](https://formspree.io)
2. Create a form and get your form ID
3. In `src/app/contact/ContactForm.tsx`, replace the `handleSubmit` function with a fetch to `https://formspree.io/f/YOUR_FORM_ID`

**Developer option: Resend or SendGrid** — both have Next.js guides online.

---

## 📁 Project Structure

```
sacred-hearts/
├── public/
│   └── logo.png          ← PUT YOUR LOGO HERE
├── src/
│   ├── app/
│   │   ├── page.tsx             ← Homepage
│   │   ├── shop/
│   │   │   ├── page.tsx         ← Shop listing
│   │   │   └── [id]/page.tsx    ← Product detail
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── donate/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── shipping/page.tsx
│   │   ├── order-success/page.tsx
│   │   └── api/checkout/route.ts  ← Stripe backend
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   └── Toast.tsx
│   ├── lib/
│   │   ├── products.ts       ← ALL PRODUCTS LIVE HERE
│   │   └── cart-context.tsx  ← Shopping cart logic
│   └── styles/
│       └── globals.css       ← Colors & design system
├── .env.example              ← Copy to .env.local for local dev
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 🛠 Local Development (Optional)

If you want to run the site on your own computer:

```bash
# Install Node.js from nodejs.org first, then:
npm install
cp .env.example .env.local
# Fill in your Stripe keys in .env.local
npm run dev
# Open http://localhost:3000
```

---

## 📞 Need Help?

Contact The Sacred Hearts: info@thesacredhearts.org · 513.741.3400
