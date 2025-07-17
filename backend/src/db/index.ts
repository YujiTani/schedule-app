import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/schedule_app';

// postgres クライアントの作成
const client = postgres(connectionString);

// drizzle インスタンスの作成
export const db = drizzle(client, { schema });

export * from './schema.js';