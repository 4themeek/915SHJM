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
      desc TEXT NOT NULL DEFAULT '',
      sale BOOLEAN NOT NULL DEFAULT false,
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
    INSERT INTO products (name, cat, price, start_price, img, desc, sale, out_of_stock, is_free, weight_oz, active)
    VALUES (${data.name}, ${data.cat}, ${data.price}, ${data.start_price}, ${data.img}, ${data.desc},
            ${data.sale}, ${data.out_of_stock}, ${data.is_free}, ${data.weight_oz}, ${data.active})
    RETURNING *
  `;
  return rows[0];
}

export async function updateProduct(id: number, data: Partial<Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>>): Promise<DbProduct> {
  const { rows } = await sql<DbProduct>`
    UPDATE products SET
      name = COALESCE(${data.name ?? null}, name),
      cat = COALESCE(${data.cat ?? null}, cat),
      price = COALESCE(${data.price ?? null}, price),
      start_price = COALESCE(${data.start_price ?? null}, start_price),
      img = COALESCE(${data.img ?? null}, img),
      desc = COALESCE(${data.desc ?? null}, desc),
      sale = COALESCE(${data.sale ?? null}, sale),
      out_of_stock = COALESCE(${data.out_of_stock ?? null}, out_of_stock),
      is_free = COALESCE(${data.is_free ?? null}, is_free),
      weight_oz = COALESCE(${data.weight_oz ?? null}, weight_oz),
      active = COALESCE(${data.active ?? null}, active),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0];
}

export async function deleteProduct(id: number): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`;
}

export async function seedProducts(products: any[]): Promise<void> {
  for (const p of products) {
    await sql`
      INSERT INTO products (name, cat, price, start_price, img, desc, sale, out_of_stock, is_free, weight_oz, active)
      VALUES (${p.name}, ${p.cat}, ${p.price}, ${p.startPrice}, ${p.img}, ${p.desc},
              ${p.sale ?? false}, ${p.outOfStock ?? false}, ${p.isFree ?? false}, ${p.weightOz ?? 8}, true)
      ON CONFLICT DO NOTHING
    `;
  }
}
