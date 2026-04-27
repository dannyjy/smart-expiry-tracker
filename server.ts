import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('inventory.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'staff'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    min_stock_level INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    batch_num TEXT,
    expiry_date TEXT,
    quantity INTEGER,
    cost_per_unit REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER,
    trigger_date TEXT,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(batch_id) REFERENCES batches(id)
  );
`);

// Seed data if empty
const productCount = db.prepare('SELECT count(*) as count FROM products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare('INSERT INTO products (name, category, min_stock_level) VALUES (?, ?, ?)');
  insertProduct.run('Organic Milk 1L', 'Dairy', 5);
  insertProduct.run('Whole Wheat Bread', 'Bakery', 10);
  insertProduct.run('Cheddar Cheese', 'Dairy', 5);
  insertProduct.run('Greek Yogurt', 'Dairy', 15);
  insertProduct.run('Aspirin 500mg', 'Pharma', 20);
  
  const insertBatch = db.prepare('INSERT INTO batches (product_id, batch_num, expiry_date, quantity, cost_per_unit) VALUES (?, ?, ?, ?, ?)');
  const today = new Date();
  
  // Future expiry
  insertBatch.run(1, 'M123', new Date(today.getTime() + 15 * 24 * 3600 * 1000).toISOString(), 50, 2.5);
  // Near expiry (7 days)
  insertBatch.run(1, 'M124', new Date(today.getTime() + 7 * 24 * 3600 * 1000).toISOString(), 20, 2.5);
  // Expired
  insertBatch.run(2, 'B999', new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString(), 15, 1.8);
  // Healthy
  insertBatch.run(3, 'C456', new Date(today.getTime() + 60 * 24 * 3600 * 1000).toISOString(), 30, 5.0);
  // Pharma
  insertBatch.run(5, 'RX-77', new Date(today.getTime() + 12 * 24 * 3600 * 1000).toISOString(), 100, 12.0);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  
  // FEFO Inventory Logic
  app.get('/api/inventory', (req, res) => {
    const inventory = db.prepare(`
      SELECT 
        b.id as batch_id,
        p.name as product_name,
        p.category,
        b.batch_num,
        b.expiry_date,
        b.quantity,
        b.cost_per_unit
      FROM batches b
      JOIN products p ON b.product_id = p.id
      WHERE b.quantity > 0
      ORDER BY b.expiry_date ASC
    `).all();
    res.json(inventory);
  });

  app.post('/api/batches', (req, res) => {
    const { product_id, batch_num, expiry_date, quantity, cost_per_unit } = req.body;
    const info = db.prepare('INSERT INTO batches (product_id, batch_num, expiry_date, quantity, cost_per_unit) VALUES (?, ?, ?, ?, ?)').run(product_id, batch_num, expiry_date, quantity, cost_per_unit);
    res.json({ id: info.lastInsertRowid });
  });

  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products ORDER BY id DESC').all();
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const { name, category, min_stock_level } = req.body;
    const info = db.prepare('INSERT INTO products (name, category, min_stock_level) VALUES (?, ?, ?)').run(name, category, min_stock_level);
    res.json({ id: info.lastInsertRowid });
  });

  // Reporting: Dead Capital
  app.get('/api/reports/dead-capital', (req, res) => {
    const now = new Date().toISOString();
    const result = db.prepare(`
      SELECT SUM(quantity * cost_per_unit) as total_dead_capital
      FROM batches
      WHERE expiry_date < ? AND quantity > 0
    `).get(now) as { total_dead_capital: number };
    res.json({ dead_capital: result.total_dead_capital || 0 });
  });

  // Alert Engine Logic (Can be called on demand or periodic)
  app.get('/api/alerts/check', (req, res) => {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 30);
    const thresholdStr = thresholdDate.toISOString();
    const nowStr = new Date().toISOString();

    const nearExpiryBatches = db.prepare(`
      SELECT id FROM batches 
      WHERE expiry_date <= ? AND expiry_date >= ?
      AND id NOT IN (SELECT batch_id FROM alerts WHERE status = 'pending')
    `).all(thresholdStr, nowStr) as { id: number }[];

    const insertAlert = db.prepare('INSERT INTO alerts (batch_id, trigger_date) VALUES (?, ?)');
    nearExpiryBatches.forEach(batch => {
      insertAlert.run(batch.id, nowStr);
    });

    res.json({ triggered: nearExpiryBatches.length });
  });

  app.get('/api/alerts', (req, res) => {
    const alerts = db.prepare(`
      SELECT 
        a.id,
        p.name as product_name,
        b.expiry_date,
        a.trigger_date,
        a.status
      FROM alerts a
      JOIN batches b ON a.batch_id = b.id
      JOIN products p ON b.product_id = p.id
      ORDER BY a.trigger_date DESC
    `).all();
    res.json(alerts);
  });

  app.post('/api/alerts/:id/resolve', (req, res) => {
    const { id } = req.params;
    db.prepare('UPDATE alerts SET status = @status WHERE id = @id').run({ status: 'resolved', id });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
