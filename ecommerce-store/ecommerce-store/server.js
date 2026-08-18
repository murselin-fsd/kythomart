const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_2026';

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASS, 10);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');

const readData = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
  } catch (err) {
    return defaultData;
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {}
};

if (!fs.existsSync(PRODUCTS_FILE) || readData(PRODUCTS_FILE).length === 0) {
  const seedProducts = [
    { id: 1, name: 'Minimalist Leather Backpack', price: 79.99, category: 'Accessories', stock: 12, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
    { id: 2, name: 'Wireless Studio Headphones', price: 149.50, category: 'Electronics', stock: 8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
    { id: 3, name: 'Insulated Stainless Steel Bottle', price: 24.00, category: 'Lifestyle', stock: 25, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500' },
    { id: 4, name: 'RGB Mechanical Gaming Keyboard', price: 89.99, category: 'Electronics', stock: 6, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500' }
  ];
  writeData(PRODUCTS_FILE, seedProducts);
}

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied: No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token.' });
  }
};

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USER || !bcrypt.compareSync(password, ADMIN_HASH)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  const token = jwt.sign({ username: ADMIN_USER, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ success: true, token });
});

app.get('/api/products', (req, res) => {
  res.json(readData(PRODUCTS_FILE));
});

app.post('/api/checkout', (req, res) => {
  const { customer, items, total } = req.body;
  if (!customer || !items || !items.length) {
    return res.status(400).json({ error: 'Incomplete order payload.' });
  }
  const orders = readData(ORDERS_FILE);
  const newOrder = {
    orderId: 'ORD-' + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    customer,
    items,
    total: parseFloat(total),
    status: 'Pending Dispatch'
  };
  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  const products = readData(PRODUCTS_FILE);
  items.forEach(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (prod) prod.stock = Math.max(0, prod.stock - cartItem.quantity);
  });
  writeData(PRODUCTS_FILE, products);
  res.status(201).json({ success: true, orderId: newOrder.orderId });
});

app.post('/api/products', requireAdminAuth, (req, res) => {
  const { name, price, category, stock, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required.' });
  const products = readData(PRODUCTS_FILE);
  const newProduct = {
    id: Date.now(),
    name: name.trim(),
    price: parseFloat(price),
    category: category ? category.trim() : 'General',
    stock: parseInt(stock, 10) || 0,
    image: image ? image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
  };
  products.unshift(newProduct);
  writeData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  const productId = parseInt(req.params.id, 10);
  let products = readData(PRODUCTS_FILE);
  products = products.filter(p => p.id !== productId);
  writeData(PRODUCTS_FILE, products);
  res.json({ success: true, message: 'Product removed.' });
});

app.get('/api/orders', requireAdminAuth, (req, res) => {
  res.json(readData(ORDERS_FILE));
});

app.patch('/api/orders/:id/status', requireAdminAuth, (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  order.status = status;
  writeData(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 E-Commerce Store live at: http://localhost:${PORT}`);
  console.log(`🔑 Default Admin Credentials: ${ADMIN_USER} /${ADMIN_PASS}`);
  console.log(`=================================================`);
});
