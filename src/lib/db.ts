import { sql } from '@vercel/postgres';

export interface DbProduct {
  id: number;
  name: string;
  cat: string;
  categories: string[] | null;
  price: string;
  start_price: number;
  img: string;
  desc: string;
  sale: boolean;
  sale_price: number | null;
  sale_ends_at: string | null;
  out_of_stock: boolean;
  is_free: boolean;
  weight_oz: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Cleans a raw categories payload down to at most 5 unique, non-empty
// strings. `cat` (the legacy primary category) is used as the fallback if
// nothing valid comes through.
export function sanitizeCategories(raw: unknown, fallbackCat?: string): string[] {
  const list = Array.isArray(raw) ? raw : [];
  const cleaned = Array.from(new Set(
    list.map(c => String(c).trim()).filter(Boolean)
  )).slice(0, 5);
  if (cleaned.length === 0 && fallbackCat) return [fallbackCat];
  return cleaned;
}

export async function createProductsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
      categories TEXT[] NOT NULL DEFAULT '{}',
      price TEXT NOT NULL,
      start_price NUMERIC(10,2) NOT NULL DEFAULT 0,
      img TEXT NOT NULL DEFAULT '',
      "desc" TEXT NOT NULL DEFAULT '',
      sale BOOLEAN NOT NULL DEFAULT false,
      sale_price NUMERIC(10,2) DEFAULT NULL,
      sale_ends_at TIMESTAMPTZ DEFAULT NULL,
      out_of_stock BOOLEAN NOT NULL DEFAULT false,
      is_free BOOLEAN NOT NULL DEFAULT false,
      weight_oz INTEGER NOT NULL DEFAULT 8,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAllProducts(): Promise<DbProduct[]> {
  const { rows } = await sql<DbProduct>`
    SELECT * FROM products WHERE active = true ORDER BY id ASC
  `;
  return rows;
}

export async function getAllProductsAdmin(): Promise<DbProduct[]> {
  const { rows } = await sql<DbProduct>`
    SELECT * FROM products ORDER BY id ASC
  `;
  return rows;
}

export async function getProductById(id: number): Promise<DbProduct | null> {
  const { rows } = await sql<DbProduct>`
    SELECT * FROM products WHERE id = ${id}
  `;
  return rows[0] || null;
}

export async function createProduct(data: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DbProduct> {
  const { rows } = await sql<DbProduct>`
    INSERT INTO products (name, cat, categories, price, start_price, img, "desc", sale, sale_price, sale_ends_at, out_of_stock, is_free, weight_oz, active)
    VALUES (${data.name}, ${data.cat}, ${(data.categories ?? [data.cat]) as any}, ${data.price}, ${data.start_price}, ${data.img}, ${data.desc},
            ${data.sale}, ${data.sale_price ?? null}, ${data.sale_ends_at ?? null},
            ${data.out_of_stock}, ${data.is_free}, ${data.weight_oz}, ${data.active})
    RETURNING *
  `;
  return rows[0];
}

export async function updateProduct(id: number, data: Partial<Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>>): Promise<DbProduct> {
  // Sanitize all values explicitly
  const saleVal = data.sale !== undefined ? Boolean(data.sale) : null;
  const salePrice = data.sale_price != null && Number(data.sale_price) > 0
    ? Number(data.sale_price)
    : null;
  const saleEndsAt = data.sale_ends_at && data.sale_ends_at !== ''
    ? data.sale_ends_at
    : null;

  const { rows } = await sql<DbProduct>`
    UPDATE products SET
      name        = COALESCE(${data.name ?? null}, name),
      cat         = COALESCE(${data.cat ?? null}, cat),
      categories  = COALESCE(${(data.categories ?? null) as any}, categories),
      price       = COALESCE(${data.price ?? null}, price),
      start_price = COALESCE(${data.start_price ?? null}, start_price),
      img         = COALESCE(${data.img ?? null}, img),
      "desc"      = COALESCE(${data.desc ?? null}, "desc"),
      sale        = COALESCE(${saleVal}, sale),
      sale_price  = ${salePrice},
      sale_ends_at = ${saleEndsAt},
      out_of_stock = COALESCE(${data.out_of_stock ?? null}, out_of_stock),
      is_free     = COALESCE(${data.is_free ?? null}, is_free),
      weight_oz   = COALESCE(${data.weight_oz ?? null}, weight_oz),
      active      = COALESCE(${data.active ?? null}, active),
      updated_at  = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteProduct(id: number): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function seedProducts(products: any[]): Promise<void> {
  // Ensure unique constraint exists to prevent duplicates
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique ON products (name)
  `;

  for (const p of products) {
    await sql`
      INSERT INTO products (name, cat, categories, price, start_price, img, "desc", sale, out_of_stock, is_free, weight_oz, active)
      VALUES (${p.name}, ${p.cat}, ${[p.cat] as any}, ${p.price}, ${p.startPrice}, ${p.img}, ${p.desc},
              ${p.sale ?? false}, ${p.outOfStock ?? false}, ${p.isFree ?? false}, ${p.weightOz ?? 8}, true)
      ON CONFLICT (name) DO UPDATE SET
        cat         = EXCLUDED.cat,
        price       = EXCLUDED.price,
        start_price = EXCLUDED.start_price,
        img         = EXCLUDED.img,
        "desc"      = EXCLUDED."desc",
        weight_oz   = EXCLUDED.weight_oz,
        updated_at  = NOW()
    `;
  }
}

// ── CLEAR ALL SALE FLAGS ──────────────────────────────────────
export async function clearAllSaleFlags(): Promise<void> {
  await sql`
    UPDATE products SET
      sale = false,
      sale_price = NULL,
      sale_ends_at = NULL,
      updated_at = NOW()
  `;
}

// ── GLOBAL SALE SETTINGS ──────────────────────────────────────
export async function createSaleSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS sale_settings (
      id SERIAL PRIMARY KEY,
      sale_ends_at TIMESTAMPTZ DEFAULT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    INSERT INTO sale_settings (id) VALUES (1) ON CONFLICT DO NOTHING
  `;
}

export async function getGlobalSaleEndDate(): Promise<string | null> {
  try {
    const { rows } = await sql`SELECT sale_ends_at FROM sale_settings WHERE id = 1`;
    return rows[0]?.sale_ends_at || null;
  } catch {
    return null;
  }
}

export async function setGlobalSaleEndDate(date: string | null): Promise<void> {
  await sql`
    UPDATE sale_settings SET sale_ends_at = ${date}, updated_at = NOW() WHERE id = 1
  `;
}

export async function applyGlobalSaleDateToAllSaleItems(date: string | null): Promise<void> {
  await sql`
    UPDATE products SET sale_ends_at = ${date}, updated_at = NOW() WHERE sale = true
  `;
}

// ── MIGRATIONS ────────────────────────────────────────────────
export async function runMigrations() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2) DEFAULT NULL`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ DEFAULT NULL`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}'`;
  // Backfill: existing rows predate the categories column — seed it from
  // their single `cat` value so multi-category filtering works immediately.
  await sql`UPDATE products SET categories = ARRAY[cat] WHERE categories = '{}' AND cat IS NOT NULL`;
}

// ── SETTINGS TABLE ────────────────────────────────────────────
export async function createSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Insert defaults if not present
  await sql`
    INSERT INTO settings (key, value) VALUES ('free_shipping_threshold', '50')
    ON CONFLICT (key) DO NOTHING
  `;
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const { rows } = await sql`SELECT value FROM settings WHERE key = ${key}`;
    return rows[0]?.value || null;
  } catch { return null; }
}

export async function setSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO settings (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
  `;
}

// ── PROMO CODES TABLE ─────────────────────────────────────────
export async function createPromoCodesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id SERIAL PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL DEFAULT 'percent',
      value NUMERIC(10,2) NOT NULL,
      min_order NUMERIC(10,2) DEFAULT NULL,
      expires_at TIMESTAMPTZ DEFAULT NULL,
      active BOOLEAN NOT NULL DEFAULT true,
      uses INTEGER NOT NULL DEFAULT 0,
      max_uses INTEGER DEFAULT NULL,
      applies_to_shipping BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Migrate existing tables that predate this column
  await sql`ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS applies_to_shipping BOOLEAN NOT NULL DEFAULT false`;
}

export interface PromoCode {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number | null;
  expires_at: string | null;
  active: boolean;
  uses: number;
  max_uses: number | null;
  applies_to_shipping: boolean;
  created_at: string;
}

export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const { rows } = await sql<PromoCode>`
    SELECT * FROM promo_codes ORDER BY created_at DESC
  `;
  return rows;
}

export async function validatePromoCode(code: string, orderTotal: number): Promise<{
  valid: boolean;
  error?: string;
  promo?: PromoCode;
}> {
  const { rows } = await sql<PromoCode>`
    SELECT * FROM promo_codes WHERE UPPER(code) = UPPER(${code}) AND active = true
  `;
  const promo = rows[0];

  if (!promo) return { valid: false, error: 'Invalid promo code' };
  if (promo.expires_at && new Date(promo.expires_at) < new Date())
    return { valid: false, error: 'This promo code has expired' };
  if (promo.max_uses && promo.uses >= promo.max_uses)
    return { valid: false, error: 'This promo code has reached its usage limit' };
  if (promo.min_order && orderTotal < Number(promo.min_order))
    return { valid: false, error: `Minimum order of $${Number(promo.min_order).toFixed(2)} required` };

  return { valid: true, promo };
}

export async function incrementPromoUses(code: string): Promise<void> {
  await sql`UPDATE promo_codes SET uses = uses + 1 WHERE UPPER(code) = UPPER(${code})`;
}

export async function createPromoCode(data: Omit<PromoCode, 'id' | 'uses' | 'created_at'>): Promise<PromoCode> {
  const { rows } = await sql<PromoCode>`
    INSERT INTO promo_codes (code, type, value, min_order, expires_at, active, max_uses, applies_to_shipping)
    VALUES (UPPER(${data.code}), ${data.type}, ${data.value}, ${data.min_order ?? null},
            ${data.expires_at ?? null}, ${data.active}, ${data.max_uses ?? null}, ${data.applies_to_shipping ?? false})
    RETURNING *
  `;
  return rows[0];
}

export async function deletePromoCode(id: number): Promise<void> {
  await sql`DELETE FROM promo_codes WHERE id = ${id}`;
}

export async function togglePromoCode(id: number, active: boolean): Promise<void> {
  await sql`UPDATE promo_codes SET active = ${active} WHERE id = ${id}`;
}

// ─────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────

export interface DbOrder {
  id: number;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  shipping_name: string | null;
  shipping_street1: string | null;
  shipping_street2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  weight_oz: number;
  shippo_rate_id: string | null;
  shippo_transaction_id: string | null;
  label_url: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  line_items: any;
  status: string;
  refund_request_id: string | null;
  refund_status: string | null;
  promo_code: string | null;
  promo_discount: number | null;
  viewed: boolean;
  created_at: string;
  updated_at: string;
}

export async function createOrdersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent TEXT,
      customer_email TEXT,
      customer_name TEXT,
      amount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      shipping_name TEXT,
      shipping_street1 TEXT,
      shipping_street2 TEXT,
      shipping_city TEXT,
      shipping_state TEXT,
      shipping_zip TEXT,
      shipping_country TEXT DEFAULT 'US',
      weight_oz INTEGER NOT NULL DEFAULT 8,
      shippo_rate_id TEXT,
      shippo_transaction_id TEXT,
      label_url TEXT,
      tracking_number TEXT,
      tracking_url TEXT,
      carrier TEXT,
      line_items JSONB,
      status TEXT NOT NULL DEFAULT 'paid',
      refund_request_id TEXT,
      refund_status TEXT,
      promo_code TEXT,
      promo_discount NUMERIC(10,2),
      viewed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Migrate existing tables that predate these columns
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_discount NUMERIC(10,2)`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS viewed BOOLEAN NOT NULL DEFAULT false`;
}

export async function getUnviewedOrderCount(): Promise<number> {
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM orders WHERE viewed = false`;
  return (rows[0] as any)?.count ?? 0;
}

export async function markAllOrdersViewed(): Promise<void> {
  await sql`UPDATE orders SET viewed = true WHERE viewed = false`;
}

export async function orderExistsBySessionId(sessionId: string): Promise<boolean> {
  const { rows } = await sql`SELECT id FROM orders WHERE stripe_session_id = ${sessionId}`;
  return rows.length > 0;
}

export async function createOrder(data: {
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  customer_email: string | null;
  customer_name: string | null;
  amount_total: number;
  currency: string;
  shipping_name: string | null;
  shipping_street1: string | null;
  shipping_street2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  weight_oz: number;
  shippo_rate_id: string | null;
  line_items: any;
  promo_code?: string | null;
  promo_discount?: number | null;
}): Promise<DbOrder> {
  const { rows } = await sql<DbOrder>`
    INSERT INTO orders (
      stripe_session_id, stripe_payment_intent, customer_email, customer_name,
      amount_total, currency, shipping_name, shipping_street1, shipping_street2,
      shipping_city, shipping_state, shipping_zip, shipping_country, weight_oz,
      shippo_rate_id, line_items, status, promo_code, promo_discount
    )
    VALUES (
      ${data.stripe_session_id}, ${data.stripe_payment_intent}, ${data.customer_email}, ${data.customer_name},
      ${data.amount_total}, ${data.currency}, ${data.shipping_name}, ${data.shipping_street1}, ${data.shipping_street2},
      ${data.shipping_city}, ${data.shipping_state}, ${data.shipping_zip}, ${data.shipping_country}, ${data.weight_oz},
      ${data.shippo_rate_id}, ${JSON.stringify(data.line_items)}::jsonb, 'paid',
      ${data.promo_code ?? null}, ${data.promo_discount ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getAllOrdersAdmin(): Promise<DbOrder[]> {
  const { rows } = await sql<DbOrder>`SELECT * FROM orders ORDER BY created_at DESC`;
  return rows;
}

export async function getOrderById(id: number): Promise<DbOrder | null> {
  const { rows } = await sql<DbOrder>`SELECT * FROM orders WHERE id = ${id}`;
  return rows[0] || null;
}

export async function saveLabelToOrder(id: number, data: {
  shippo_transaction_id: string;
  label_url: string;
  tracking_number: string;
  tracking_url: string | null;
  carrier: string;
}): Promise<DbOrder> {
  const { rows } = await sql<DbOrder>`
    UPDATE orders SET
      shippo_transaction_id = ${data.shippo_transaction_id},
      label_url = ${data.label_url},
      tracking_number = ${data.tracking_number},
      tracking_url = ${data.tracking_url},
      carrier = ${data.carrier},
      status = 'shipped',
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function saveRefundToOrder(id: number, data: {
  refund_request_id: string;
  refund_status: string;
}): Promise<DbOrder> {
  const { rows } = await sql<DbOrder>`
    UPDATE orders SET
      refund_request_id = ${data.refund_request_id},
      refund_status = ${data.refund_status},
      status = 'cancelled',
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteOrder(id: number): Promise<void> {
  await sql`DELETE FROM orders WHERE id = ${id}`;
}

// ─────────────────────────────────────────────────────────────
// CONTACT MESSAGES
// ─────────────────────────────────────────────────────────────

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  viewed: boolean;
  created_at: string;
}

export async function createContactMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      read BOOLEAN NOT NULL DEFAULT false,
      viewed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS viewed BOOLEAN NOT NULL DEFAULT false`;
}

export async function getUnviewedMessageCount(): Promise<number> {
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM contact_messages WHERE viewed = false`;
  return (rows[0] as any)?.count ?? 0;
}

export async function markAllMessagesViewed(): Promise<void> {
  await sql`UPDATE contact_messages SET viewed = true WHERE viewed = false`;
}

export async function createContactMessage(data: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
}): Promise<ContactMessage> {
  const { rows } = await sql<ContactMessage>`
    INSERT INTO contact_messages (name, email, phone, message)
    VALUES (${data.name}, ${data.email}, ${data.phone ?? null}, ${data.message})
    RETURNING *
  `;
  return rows[0];
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const { rows } = await sql<ContactMessage>`
    SELECT * FROM contact_messages ORDER BY created_at DESC
  `;
  return rows;
}

export async function markContactMessageRead(id: number, read: boolean): Promise<void> {
  await sql`UPDATE contact_messages SET read = ${read} WHERE id = ${id}`;
}

export async function deleteContactMessage(id: number): Promise<void> {
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
}

// ─────────────────────────────────────────────────────────────
// DONATIONS  (from /donate and /give — kept separate from `orders`
// since they have no shipment, and the "Rec'd" nav badge needs a
// dedicated `viewed` flag)
// ─────────────────────────────────────────────────────────────

export interface Donation {
  id: number;
  stripe_session_id: string;
  source: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
  status: string;
  thank_you_sent_at: string | null;
  viewed: boolean;
  created_at: string;
}

export async function createDonationsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS donations (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL DEFAULT 'donate',
      donor_name TEXT,
      donor_email TEXT,
      amount NUMERIC(10,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'received',
      thank_you_sent_at TIMESTAMPTZ,
      viewed BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function donationExistsBySessionId(sessionId: string): Promise<boolean> {
  const { rows } = await sql`SELECT id FROM donations WHERE stripe_session_id = ${sessionId}`;
  return rows.length > 0;
}

export async function createDonation(data: {
  stripe_session_id: string;
  source: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number;
  currency: string;
}): Promise<Donation> {
  const { rows } = await sql<Donation>`
    INSERT INTO donations (stripe_session_id, source, donor_name, donor_email, amount, currency)
    VALUES (${data.stripe_session_id}, ${data.source}, ${data.donor_name}, ${data.donor_email}, ${data.amount}, ${data.currency})
    RETURNING *
  `;
  return rows[0];
}

export async function getAllDonationsAdmin(): Promise<Donation[]> {
  const { rows } = await sql<Donation>`SELECT * FROM donations ORDER BY created_at DESC`;
  return rows;
}

export async function getDonationById(id: number): Promise<Donation | null> {
  const { rows } = await sql<Donation>`SELECT * FROM donations WHERE id = ${id}`;
  return rows[0] || null;
}

export async function getUnviewedDonationCount(): Promise<number> {
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM donations WHERE viewed = false`;
  return (rows[0] as any)?.count ?? 0;
}

export async function markAllDonationsViewed(): Promise<void> {
  await sql`UPDATE donations SET viewed = true WHERE viewed = false`;
}

export async function markDonationThankYouSent(id: number): Promise<Donation> {
  const { rows } = await sql<Donation>`
    UPDATE donations SET thank_you_sent_at = NOW() WHERE id = ${id} RETURNING *
  `;
  return rows[0];
}
