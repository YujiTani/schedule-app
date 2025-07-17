import { Pool } from "pg";

let pool: Pool;

/**
 * データベース接続プールを取得
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on("error", (err) => {
      console.error("Database pool error:", err);
    });
  }

  return pool;
}

/**
 * データベース接続テスト
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

/**
 * データベース接続を閉じる
 */
export async function closeConnection(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}