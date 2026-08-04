import { sql } from '@vercel/postgres';

async function createRateLimitsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT NOT NULL,
      window_start TIMESTAMPTZ NOT NULL,
      count INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (key, window_start)
    )
  `;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

// Fixed-window counter backed by Postgres (already provisioned for this
// project, no new service to stand up). Fails open on any infra error —
// a rate-limit hiccup should never block a legitimate submission.
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    await createRateLimitsTable();
    const windowMs = windowSeconds * 1000;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();

    const { rows } = await sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, ${windowStart}, 1)
      ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
      RETURNING count
    `;

    // Occasionally sweep old windows so the table doesn't grow unbounded.
    if (Math.random() < 0.02) {
      await sql`DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour'`;
    }

    return rows[0].count <= limit;
  } catch {
    return true;
  }
}
