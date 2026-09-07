import dotenv from 'dotenv';
import pg from 'pg';
import crypto from 'node:crypto';
const { Pool } = pg;

dotenv.config({ path: new URL('./.env', import.meta.url) });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
});

const addAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin';
  
  // Basic SHA-256 hash for demonstration purposes
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  await pool.query(
    'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
    [username, passwordHash]
  );
  console.log(`Admin user '${username}' added successfully.`);
};

addAdmin()
  .catch((error) => {
    console.error(`Failed to add admin: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
