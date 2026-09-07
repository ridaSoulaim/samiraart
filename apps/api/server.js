import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const tokenSecret = process.env.ADMIN_TOKEN_SECRET;
const sessions = new Map();

if (!tokenSecret || !process.env.POSTGRES_DB) {
  throw new Error('POSTGRES_DB and ADMIN_TOKEN_SECRET are required in apps/api/.env');
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || '',
  max: 10,
});

app.use(cors({ origin: process.env.WEB_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '1mb' }));

const signToken = (username) => {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const value = `${username}.${expiresAt}.${crypto.randomBytes(24).toString('hex')}`;
  const signature = crypto.createHmac('sha256', tokenSecret).update(value).digest('hex');
  const token = `${value}.${signature}`;
  sessions.set(token, { username, expiresAt });
  return token;
};

const requireAdmin = (request, response, next) => {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const session = token ? sessions.get(token) : null;
  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return response.status(401).json({ error: 'Admin authentication required' });
  }
  request.admin = session;
  return next();
};

const productFromRow = (row) => {
  const product = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
  return {
    ...product,
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    price_in_cents: row.price_in_cents,
    description: row.description,
    type: { value: row.category },
    variants: [{
      ...(product.variants?.[0] || {}),
      price_in_cents: row.price_in_cents,
      inventory_quantity: row.stock,
      image_url: row.image,
    }],
  };
};

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');
    response.json({ ok: true, database: 'postgres' });
  } catch (error) {
    response.status(503).json({ ok: false, error: error.message });
  }
});

app.post('/api/admin/login', (request, response) => {
  const { username, password } = request.body || {};
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return response.status(401).json({ error: 'Invalid credentials' });
  }
  return response.json({ token: signToken(username), username });
});

app.get('/api/products', async (_request, response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    response.json({ products: rows.map(productFromRow) });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.post('/api/products', requireAdmin, async (request, response) => {
  try {
    const product = request.body;
    const variant = product.variants?.[0] || {};
    await pool.query(
      `INSERT INTO products (id, title, subtitle, category, image, price_in_cents, stock, description, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [product.id, product.title, product.subtitle || '', product.type?.value || 'embroideries', product.image || '',
        Number(product.price_in_cents || 0), Number(variant.inventory_quantity || 0), product.description || '', JSON.stringify(product)],
    );
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [product.id]);
    response.status(201).json(productFromRow(rows[0]));
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (request, response) => {
  try {
    const product = request.body;
    const variant = product.variants?.[0] || {};
    const { rowCount } = await pool.query(
      `UPDATE products SET title = $1, subtitle = $2, category = $3, image = $4, price_in_cents = $5, stock = $6, description = $7, payload = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`,
      [product.title, product.subtitle || '', product.type?.value || 'embroideries', product.image || '', Number(product.price_in_cents || 0),
        Number(variant.inventory_quantity || 0), product.description || '', JSON.stringify(product), request.params.id],
    );
    if (!rowCount) return response.status(404).json({ error: 'Product not found' });
    const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [request.params.id]);
    return response.json(productFromRow(rows[0]));
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (request, response) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [request.params.id]);
    if (!rowCount) return response.status(404).json({ error: 'Product not found' });
    return response.status(204).end();
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Samira Art API listening on http://localhost:${port}`));