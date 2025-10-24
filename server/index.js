import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, '../web')));

// Load products
const productsPath = path.join(__dirname, 'data', 'products.json');
let PRODUCTS = JSON.parse(readFileSync(productsPath, 'utf-8'));

// Simple in-memory order store
const orders = new Map();

app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

app.get('/api/marketing', (req, res) => {
  res.json({
    heroTitle: 'Premium Rice, Freshly Milled',
    heroSubtitle: '15 handpicked rice varieties for every taste and dish',
    highlights: [
      'Farm-to-bag freshness',
      'Free local delivery over 25kg',
      'Bulk and wholesale pricing available'
    ],
    about: 'We are a local rice mill and shop delivering authentic, quality rice varieties sourced from trusted farms. We mill fresh and pack with care.'
  });
});

app.post('/api/orders', (req, res) => {
  try {
    const { customer, items } = req.body || {};
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ error: 'Invalid customer details' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order items required' });
    }

    // Validate and compute
    const lines = [];
       let subtotal = 0;
    for (const it of items) {
      const p = PRODUCTS.find(pr => pr.id === it.productId);
      if (!p) return res.status(400).json({ error: `Product not found: ${it.productId}` });
      const qty = Number(it.qtyKg);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${p.name}` });
      }
      if (qty > p.stockKg) {
        return res.status(400).json({ error: `Insufficient stock for ${p.name}` });
      }
      const lineTotal = +(qty * p.pricePerKg).toFixed(2);
      subtotal += lineTotal;
      lines.push({ productId: p.id, name: p.name, pricePerKg: p.pricePerKg, qtyKg: qty, lineTotal });
    }

    const taxRate = 0.05; // 5% tax (configurable)
    const tax = +(subtotal * taxRate).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);

    // Persist: reduce stock (demo only; would use DB in production)
    for (const l of lines) {
      const idx = PRODUCTS.findIndex(pr => pr.id === l.productId);
      PRODUCTS[idx].stockKg = +(PRODUCTS[idx].stockKg - l.qtyKg).toFixed(2);
    }
    try {
      // Save stock back to file (best-effort for demo)
      writeFileSync(productsPath, JSON.stringify(PRODUCTS, null, 2));
    } catch {}

    const id = 'INV-' + Date.now();
    const invoice = {
      id,
      createdAt: new Date().toISOString(),
      customer,
      lines,
      subtotal: +subtotal.toFixed(2),
      tax,
      total
    };
    orders.set(id, invoice);

    res.json(invoice);
  } catch (e) {
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  const inv = orders.get(req.params.id);
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

app.listen(PORT, () => {
  console.log(`Rice shop server running at http://localhost:${PORT}`);
});
