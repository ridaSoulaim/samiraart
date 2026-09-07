import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;
import { getProducts } from '../web/src/api/EcommerceApi.js';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 5,
});

const fetchAllProducts = async () => {
  const products = [];
  for (let offset = 0; ; offset += 100) {
    const page = await getProducts({ limit: 100, offset });
    products.push(...page.products);
    if (page.products.length < 100) return products;
  }
};

const sync = async () => {
  if (!process.env.POSTGRES_DB) throw new Error('POSTGRES_DB is missing in apps/api/.env');
  const products = await fetchAllProducts();

  for (const product of products) {
    const variant = product.variants?.[0] || {};
    await pool.query(
      `INSERT INTO products (id, title, subtitle, category, image, price_in_cents, stock, description, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, category = EXCLUDED.category,
       image = EXCLUDED.image, price_in_cents = EXCLUDED.price_in_cents, stock = EXCLUDED.stock,
       description = EXCLUDED.description, payload = EXCLUDED.payload, updated_at = CURRENT_TIMESTAMP`,
      [product.id, product.title || '', product.subtitle || '', product.type?.value || 'embroideries', product.image || '',
        Number(product.price_in_cents || variant.price_in_cents || 0), Number(variant.inventory_quantity || 0),
        product.description || '', JSON.stringify(product)],
    );
  }

  console.log(`Synchronized ${products.length} products into ${process.env.POSTGRES_DB}.`);
};

sync()
  .catch((error) => {
    console.error(`Product synchronization failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());