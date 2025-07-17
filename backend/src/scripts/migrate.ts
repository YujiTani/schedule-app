import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../db/index.js';
import postgres from 'postgres';

async function runMigrations() {
  console.log('🔄 Running migrations...');
  
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

runMigrations();