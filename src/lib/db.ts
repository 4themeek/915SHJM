import { sql } from '@vercel/postgres';

export interface DbProduct {
  id: number;
  name: string;
  cat: string;
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

export async function createProductsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      cat TEXT NOT NULL,
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
    INSERT INTO products (name, cat, price, start_price, img, "desc", sale, sale_price, sale_ends_at, out_of_stock, is_free, weight_oz, active)
    VALUES (${data.name}, ${data.cat}, ${data.price}, ${data.start_price}, ${data.img}, ${data.desc},
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
      INSERT INTO products (name, cat, price, start_price, img, "desc", sale, out_of_stock, is_free, weight_oz, active)
      VALUES (${p.name}, ${p.cat}, ${p.price}, ${p.startPrice}, ${p.img}, ${p.desc},
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
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
    INSERT INTO promo_codes (code, type, value, min_order, expires_at, active, max_uses)
    VALUES (UPPER(${data.code}), ${data.type}, ${data.value}, ${data.min_order ?? null},
            ${data.expires_at ?? null}, ${data.active}, ${data.max_uses ?? null})
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
