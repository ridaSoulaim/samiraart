import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config({ path: new URL('./.env', import.meta.url) });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
});

const init = async () => {
  if (!process.env.POSTGRES_DB) throw new Error('POSTGRES_DB is missing in apps/api/.env');
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  for (const statement of schema.split(';').map((part) => part.trim()).filter(Boolean)) {
    await pool.query(statement);
  }
  console.log(`Database ${process.env.POSTGRES_DB} is ready.`);
};

init()
  .catch((error) => {
    console.error(`Database initialization failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());