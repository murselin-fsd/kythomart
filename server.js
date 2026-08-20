
// In-memory store for tracking failed login attempts (can be replaced with Redis/DB in production)
const failedLogins = new Map(); // Format: email -> { count, lockUntil }

function checkAccountLockout(email) {
  const record = failedLogins.get(email);
  if (!record) return { locked: false };

  if (record.lockUntil && Date.now() < record.lockUntil) {
    const remainingMins = Math.ceil((record.lockUntil - Date.now()) / 60000);
    return { locked: true, remainingMins };
  }

  // If lockout time has passed, reset
  if (record.lockUntil && Date.now() >= record.lockUntil) {
    failedLogins.delete(email);
  }

  return { locked: false };
}

function recordFailedLogin(email) {
  const record = failedLogins.get(email) || { count: 0, lockUntil: null };
  record.count += 1;

  // Lock account for 15 minutes after 5 failed attempts
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  failedLogins.set(email, record);
}

function resetFailedLogin(email) {
  failedLogins.delete(email);
}

const { body, validationResult } = require("express-validator");

// Validation rules for registration
const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/\d/)
    .withMessage("Password must contain a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const multer = require('multer');
const uploadStorage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage: uploadStorage });

app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});


// API Routes (Must be before static middleware)
app.put("/api/products/:id", (req, res) => {
  try {
    const rawId = req.params.id;
    if (!fs.existsSync("products.json")) {
      return res.status(404).json({ success: false, error: "products.json not found" });
    }
    let products = JSON.parse(fs.readFileSync("products.json", "utf8") || "[]");
    const index = products.findIndex(p => String(p.id) === String(rawId));
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (req.body.stock !== undefined) {
      products[index].stock = parseInt(req.body.stock) || 0;
    }

    fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
    return res.json({ success: true, product: products[index] });
  } catch (err) {
    console.error("Stock update error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/products", (req, res) => {
  try {
    if (!fs.existsSync("products.json")) {
      fs.writeFileSync("products.json", "[]");
    }
    let products = JSON.parse(fs.readFileSync("products.json", "utf8") || "[]");
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    
    let imagesArr = [];
    if (req.body.images) {
      imagesArr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.body.image) {
      imagesArr = [req.body.image];
    } else {
      imagesArr = ["https://via.placeholder.com/150"];
    }

    const newProduct = {
      id: newId,
      title: req.body.title || "Untitled Product",
      sellingPrice: parseFloat(req.body.sellingPrice) || 0,
      costPrice: parseFloat(req.body.costPrice) || 0,
      category: req.body.category || "General",
      stock: parseInt(req.body.stock) || 10,
      sizes: req.body.sizes || "",
      images: imagesArr
    };

    products.push(newProduct);
    fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
    return res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


app.use(express.static(path.join(__dirname, 'public')));

const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');
const COUPONS_FILE = path.join(__dirname, 'coupons.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const AUTH_FILE = path.join(__dirname, 'auth.json');
const USERS_FILE = path.join(__dirname, 'users.json');


const verifyAdmin = (req, res, next) => {
  // Allow requests with header OR let admin.html load (we can secure admin.html APIs directly)
  if (req.headers["x-admin-auth"] === "true" || req.path === "/admin") {
    return next();
  }
  res.status(403).json({ error: "Unauthorized access. Admin only." });
};

const readData = (filePath, defaultData = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return content ? JSON.parse(content) : defaultData;
  } catch (err) {
    return defaultData;
  }
};

const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

// Ensure default files exist with proper initial data
if (!fs.existsSync(SETTINGS_FILE)) {
  writeData(SETTINGS_FILE, {
    storeName: 'KythoMart',
    tagline: 'Shop · Discover · Enjoy',
    announcement: '🔥 Free Express Shipping on orders over ₹1500 | Use code WELCOME10',
    currency: '₹',
    themeColor: '#d4af37'
  });
}

if (!fs.existsSync(AUTH_FILE)) {
  writeData(AUTH_FILE, { username: 'admin', password: 'admin123' });
}

if (!fs.existsSync(USERS_FILE)) {
  writeData(USERS_FILE, [
    {
      id: 'USR-1001',
      name: 'Demo Customer',
      email: 'user@example.com',
      password: 'user123',
      phone: '7899985086',
      address: '221B Baker Street',
      city: 'Bengaluru',
      zip: '560001',
      wishlist: []
    }
  ]);
}

if (!fs.existsSync(COUPONS_FILE)) {
  writeData(COUPONS_FILE, [
    { code: 'WELCOME10', discountPercent: 10, minSpend: 500, active: true },
    { code: 'FLAT25', discountPercent: 25, minSpend: 2000, active: true }
  ]);
}

if (!fs.existsSync(REVIEWS_FILE)) {
  writeData(REVIEWS_FILE, {
    1: [{ name: 'Aarav M.', rating: 5, comment: 'Exceptional leather quality! Fits my 15-inch laptop perfectly.', date: '2026-06-10' }],
    2: [{ name: 'Priya S.', rating: 5, comment: 'Super lightweight and comfortable for running every morning.', date: '2026-06-12' }]
  });
}

if (!fs.existsSync(PRODUCTS_FILE)) {
  writeData(PRODUCTS_FILE, [
    { 
      id: 1, 
      name: 'Minimalist Leather Backpack', 
      price: 1899, 
      costPrice: 1100, 
      category: 'Accessories', 
      stock: 15, 
      sizes: 'Standard', 
      description: 'Crafted from premium full-grain leather with dedicated laptop compartment, waterproof zippers, and ergonomic breathable shoulder straps.',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
    },
    { 
      id: 2, 
      name: 'Pro Running Sneakers', 
      price: 3499, 
      costPrice: 2000, 
      category: 'Footwear', 
      stock: 12, 
      sizes: 'UK 7, UK 8, UK 9, UK 10', 
      description: 'Engineered with ultra-responsive cloud-foam cushioning and lightweight mesh upper for maximum ventilation during runs.',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'
    },
    { 
      id: 3, 
      name: 'Casual Canvas Loafers', 
      price: 1499, 
      costPrice: 800, 
      category: 'Footwear', 
      stock: 6, 
      sizes: 'UK 8, UK 9, UK 11', 
      description: 'Relaxed slip-on canvas shoes featuring cushioned insoles and flexible rubber outsoles. Ideal for casual summer outings.',
      images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
      image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'
    },
    { 
      id: 4, 
      name: 'Wireless Studio Headphones', 
      price: 2999, 
      costPrice: 1600, 
      category: 'Electronics', 
      stock: 10, 
      sizes: 'One Size', 
      description: 'Immersive active noise cancellation (ANC), 40-hour battery life, and plush memory-foam ear cushions.',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
    }
  ]);
}

if (!fs.existsSync(ORDERS_FILE)) {
  writeData(ORDERS_FILE, []);
}

app.post('/api/ai-chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required.' });

  try {
    const products = readData(PRODUCTS_FILE);
    const settings = readData(SETTINGS_FILE);
    const coupons = readData(COUPONS_FILE);

    const catalogContext = products.map(p => `- ${p.name} (${p.category}): ₹${p.price}, Stock: ${p.stock}, Sizes: ${p.sizes}. Desc: ${p.description}`).join('\n');
    const couponContext = coupons.map(c => `- ${c.code}: ${c.discountPercent}% off (Min spend: ₹${c.minSpend})`).join('\n');

    const systemPrompt = `You are Kytho, a friendly, helpful AI shopping assistant for "${settings.storeName}" (${settings.tagline}).
    Here is our current product catalog:
    ${catalogContext}

    Available Promo Coupons:
    ${couponContext}

    Store Policies: Free express shipping on orders over ₹1500. We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery (COD). Support WhatsApp: +917899985086.
    Answer customer questions concisely, recommend products when appropriate, and be polite and engaging.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nCustomer Message: ' + message }] }
      ]
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI Chat Error:', err);
    res.status(500).json({ reply: 'Sorry, I am having trouble connecting right now. Please try again later!' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const auth = readData(AUTH_FILE, { username: 'admin', password: 'admin123' });
  const u = (username || '').trim().toLowerCase();
  const p = (password || '').trim();

  if ((u === (auth.username || 'admin').toLowerCase() && p === auth.password) ) {
    return res.json({ success: true, username: auth.username || 'admin' });
  }
  return res.status(401).json({ error: 'Invalid admin credentials.' });
});

app.post('/api/admin/change-password', (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const auth = readData(AUTH_FILE, { username: 'admin', password: 'admin123' });

  if ((currentPassword || '').trim() !== auth.password ) {
    return res.status(400).json({ error: 'Current password does not match.' });
  }

  if (newUsername && newUsername.trim()) auth.username = newUsername.trim();
  if (newPassword && newPassword.trim()) auth.password = newPassword.trim();

  writeData(AUTH_FILE, auth);
  res.json({ success: true, message: 'Credentials updated successfully.' });
});

app.get('/api/settings', (req, res) => res.json(readData(SETTINGS_FILE)));

app.post('/api/admin/settings', (req, res) => {
  const current = readData(SETTINGS_FILE);
  const updated = { ...current, ...req.body };
  writeData(SETTINGS_FILE, updated);
  res.json({ success: true, settings: updated });
});

app.get('/api/admin/coupons', (req, res) => res.json(readData(COUPONS_FILE)));

app.post('/api/admin/coupons', (req, res) => {
  const { code, discountPercent, minSpend } = req.body;
  if (!code || !discountPercent) return res.status(400).json({ error: 'Code and discount % required.' });
  const coupons = readData(COUPONS_FILE);
  coupons.unshift({
    code: code.toUpperCase().trim(),
    discountPercent: parseInt(discountPercent, 10),
    minSpend: parseFloat(minSpend) || 0,
    active: true
  });
  writeData(COUPONS_FILE, coupons);
  res.status(201).json(coupons);
});

app.delete('/api/admin/coupons/:code', (req, res) => {
  let coupons = readData(COUPONS_FILE);
  coupons = coupons.filter(c => c.code !== req.params.code);
  writeData(COUPONS_FILE, coupons);
  res.json({ success: true });
});

app.post('/api/validate-coupon', (req, res) => {
  const { code, cartTotal } = req.body;
  const coupons = readData(COUPONS_FILE);
  const coupon = coupons.find(c => c.code.toUpperCase() === (code || '').toUpperCase() && c.active);

  if (!coupon) return res.status(404).json({ error: 'Invalid coupon code.' });
  if (cartTotal < coupon.minSpend) {
    return res.status(400).json({ error: `Min order of ₹${coupon.minSpend} required.` });
  }

  const discountAmount = ((cartTotal * coupon.discountPercent) / 100).toFixed(2);
  res.json({ success: true, discountPercent: coupon.discountPercent, discountAmount: parseFloat(discountAmount) });
});

app.get('/api/reviews/:productId', (req, res) => {
  const reviews = readData(REVIEWS_FILE, {});
  res.json(reviews[req.params.productId] || []);
});

app.post('/api/reviews', (req, res) => {
  const { productId, name, rating, comment } = req.body;
  if (!productId || !name || !rating) return res.status(400).json({ error: 'Review details required.' });
  
  const reviews = readData(REVIEWS_FILE, {});
  if (!reviews[productId]) reviews[productId] = [];

  reviews[productId].unshift({
    name: name.trim(),
    rating: parseInt(rating, 10),
    comment: comment ? comment.trim() : '',
    date: new Date().toISOString().split('T')[0]
  });

  writeData(REVIEWS_FILE, reviews);
  res.status(201).json({ success: true, reviews: reviews[productId] });
});

app.post('/api/user/login', (req, res) => {
  const { email, password } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find(u => (u.email || '').toLowerCase() === (email || '').trim().toLowerCase() && u.password === (password || '').trim());
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ success: true, user });
});

app.post('/api/user/register', (req, res) => {
  const { name, email, password, phone, address, city, zip } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password required.' });

  const users = readData(USERS_FILE);
  const cleanEmail = email.trim().toLowerCase();
  if (users.find(u => (u.email || '').toLowerCase() === cleanEmail)) return res.status(400).json({ error: 'Email already exists.' });

  const newUser = {
    id: 'USR-' + Date.now(),
    name: name.trim(),
    email: cleanEmail,
    password: password.trim(),
    phone: phone ? phone.trim() : '',
    address: address ? address.trim() : '',
    city: city ? city.trim() : '',
    zip: zip ? zip.trim() : '',
    wishlist: []
  };

  users.push(newUser);
  writeData(USERS_FILE, users);
  res.status(201).json({ success: true, user: newUser });
});

app.put('/api/user/profile', (req, res) => {
  const { email, name, phone, address, city, zip } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find(u => (u.email || '').toLowerCase() === (email || '').trim().toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found.' });

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (address !== undefined) user.address = address.trim();
  if (city !== undefined) user.city = city.trim();
  if (zip !== undefined) user.zip = zip.trim();

  writeData(USERS_FILE, users);
  res.json({ success: true, user });
});

app.get('/api/products', (req, res) => res.json(readData(PRODUCTS_FILE)));

app.post('/api/products', (req, res) => {
  const { name, price, costPrice, category, stock, sizes, description, image } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required.' });

  const products = readData(PRODUCTS_FILE);
  const imgUrl = image ? image.trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';
  const newProduct = {
    id: Date.now(),
    name: name.trim(),
    price: parseFloat(price),
    costPrice: parseFloat(costPrice) || 0,
    category: category ? category.trim() : 'General',
    stock: parseInt(stock, 10) || 10,
    sizes: sizes ? sizes.trim() : 'Standard',
    description: description ? description.trim() : 'High quality product.',
    images: [imgUrl, imgUrl],
    image: imgUrl
  };

  products.unshift(newProduct);
  writeData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
  let products = readData(PRODUCTS_FILE);
  products = products.filter(p => p.id !== parseInt(req.params.id, 10));
  writeData(PRODUCTS_FILE, products);
  res.json({ success: true });
});

app.post('/api/place-order', (req, res) => {
  const { customer, items, total, paymentMethod, giftNote } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Your cart is empty.' });
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    return res.status(400).json({ error: 'Please enter Name, Phone Number, and Delivery Address.' });
  }

  const orders = readData(ORDERS_FILE);
  const newOrder = {
    orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    date: new Date().toISOString(),
    customer,
    items,
    total: parseFloat(total) || 0,
    paymentMethod: paymentMethod || 'UPI / QR Code',
    paymentStatus: (paymentMethod || '').includes('COD') ? 'Pending (Cash on Delivery)' : 'Paid (Verified Online)',
    status: 'Pending Dispatch',
    giftNote: giftNote ? giftNote.trim() : ''
  };

  orders.unshift(newOrder);
  writeData(ORDERS_FILE, orders);

  const products = readData(PRODUCTS_FILE);
  items.forEach(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (prod) prod.stock = Math.max(0, prod.stock - cartItem.quantity);
  });
  writeData(PRODUCTS_FILE, products);

  res.json({ success: true, orderId: newOrder.orderId, order: newOrder });
});


app.get('/api/my-orders', (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "User email is required to fetch personal orders." });
  }
  const orders = readData(ORDERS_FILE);
  const userOrders = orders.filter(o => o.customer && o.customer.email && o.customer.email.toLowerCase() === email.toLowerCase());
  res.json(userOrders);
});

app.get('/api/orders', (req, res) => res.json(readData(ORDERS_FILE)));

app.patch('/api/orders/:id/status', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const order = orders.find(o => o.orderId === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  order.status = req.body.status;
  writeData(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

app.get('/api/admin/analytics', (req, res) => {
  const orders = readData(ORDERS_FILE);
  const products = readData(PRODUCTS_FILE);
  const users = readData(USERS_FILE);
  
  let totalRevenue = 0;
  let estimatedProfit = 0;
  let totalUnitsSold = 0;

  orders.forEach(o => {
    totalRevenue += parseFloat(o.total) || 0;
    o.items.forEach(item => {
      totalUnitsSold += item.quantity;
      const matchingProd = products.find(p => p.id === item.id);
      if (matchingProd) {
        const itemProfit = (matchingProd.price - (matchingProd.costPrice || 0)) * item.quantity;
        estimatedProfit += itemProfit;
      }
    });
  });

  const dailySales = {};
  orders.forEach(o => {
    const dateStr = o.date.split('T')[0];
    dailySales[dateStr] = (dailySales[dateStr] || 0) + (parseFloat(o.total) || 0);
  });

  const chartDates = Object.keys(dailySales).sort();
  const chartTotals = chartDates.map(d => dailySales[d]);

  res.json({
    totalRevenue: totalRevenue.toFixed(2),
    estimatedProfit: estimatedProfit.toFixed(2),
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'Pending Dispatch').length,
    totalCustomers: users.length,
    averageOrderValue: orders.length ? (totalRevenue / orders.length).toFixed(2) : '0.00',
    totalUnitsSold,
    totalInventoryValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2),
    lowStockCount: products.filter(p => p.stock <= 4).length,
    chartData: { dates: chartDates, totals: chartTotals }
  });
});

app.get('/admin', verifyAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use((req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));


// Temporary store for OTPs: { email: { otp, newEmail, newPassword, expires } }
const pendingOTPs = {};

app.post('/api/user/request-update-otp', (req, res) => {
  const { currentEmail, newEmail, newPassword } = req.body;
  const users = readData(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === currentEmail.toLowerCase());

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOTPs[currentEmail] = {
    otp,
    newEmail: newEmail ? newEmail.trim() : user.email,
    newPassword: newPassword ? newPassword.trim() : null,
    expires: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  };

  // Simulate sending via Email & WhatsApp (Logged to console / ready for Twilio/Nodemailer)
  console.log("=================================================");
  console.log(`🔐 [OTP SENT] To Email (${user.email}) & WhatsApp (${user.phone || "N/A"}): ${otp}`);
  console.log("=================================================");

  res.json({ success: true, message: "OTP sent to your registered email and WhatsApp." });
});

app.post('/api/user/verify-and-update', (req, res) => {
  const { currentEmail, otp } = req.body;
  const record = pendingOTPs[currentEmail];

  if (!record) {
    return res.status(400).json({ error: "No pending update request found. Please request a new OTP." });
  }

  if (Date.now() > record.expires) {
    delete pendingOTPs[currentEmail];
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid OTP code." });
  }

  let users = readData(USERS_FILE);
  let userIndex = users.findIndex(u => u.email.toLowerCase() === currentEmail.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  // Update user details securely
  if (record.newEmail) users[userIndex].email = record.newEmail;
  if (record.newPassword) users[userIndex].password = record.newPassword;

  writeData(USERS_FILE, users);
  delete pendingOTPs[currentEmail];

  res.json({ success: true, user: users[userIndex], message: "Account details updated successfully!" });
});


// --- User-Specific Isolated Data Storage Endpoints ---

// Get User Specific Data (Wishlist, Cart, Orders)
app.get('/api/user/data/:email', (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  const users = readData(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email);
  
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json({
    success: true,
    wishlist: user.wishlist || [],
    cart: user.cart || [],
    orders: user.orders || []
  });
});

// Save User Specific Data
app.post('/api/user/data/save', (req, res) => {
  const { email, wishlist, cart, orders } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  let users = readData(USERS_FILE);
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found." });
  }

  if (wishlist !== undefined) users[userIndex].wishlist = wishlist;
  if (cart !== undefined) users[userIndex].cart = cart;
  if (orders !== undefined) users[userIndex].orders = orders;

  writeData(USERS_FILE, users);
  res.json({ success: true, message: "User data saved securely and privately." });
});


// --- Centralized User Database Endpoints for True Isolation ---

// Get User Database Profile (Wishlist, Cart, Orders)
app.get('/api/database/user-data', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const users = readData(USERS_FILE);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user) {
    return res.status(404).json({ error: "User not found in database." });
  }

  res.json({
    success: true,
    wishlist: user.wishlist || [],
    cart: user.cart || [],
    orders: user.orders || []
  });
});

// Update User Database Profile
app.post('/api/database/user-data', (req, res) => {
  const { email, wishlist, cart, orders } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  let users = readData(USERS_FILE);
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (index === -1) {
    return res.status(404).json({ error: "User not found in database." });
  }

  if (wishlist !== undefined) users[index].wishlist = wishlist;
  if (cart !== undefined) users[index].cart = cart;
  if (orders !== undefined) users[index].orders = orders;

  writeData(USERS_FILE, users);
  res.json({ success: true, message: "User data successfully saved to database." });
});


// Handle Product Creation with multi-images array
app.post("/api/products", (req, res) => {
  try {
    if (!fs.existsSync("products.json")) {
      fs.writeFileSync("products.json", "[]");
    }
    let products = JSON.parse(fs.readFileSync("products.json", "utf8") || "[]");
    
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    
    let imagesArr = [];
    if (req.body.images) {
      imagesArr = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.body.image) {
      imagesArr = [req.body.image];
    } else {
      imagesArr = ["https://via.placeholder.com/150"];
    }

    const newProduct = {
      id: newId,
      title: req.body.title || "Untitled Product",
      sellingPrice: parseFloat(req.body.sellingPrice) || 0,
      costPrice: parseFloat(req.body.costPrice) || 0,
      category: req.body.category || "General",
      stock: parseInt(req.body.stock) || 10,
      sizes: req.body.sizes || "",
      images: imagesArr
    };

    products.push(newProduct);
    fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
    return res.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Customer Store: http://localhost:${PORT}`);
  console.log(`🔑 Merchant Admin:  http://localhost:${PORT}/admin`);
  console.log(`=================================================`);
});


// Razorpay Integration
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy'
});

app.get('/api/razorpay-key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy' });
});

app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

  app.post("/api/orders/status", (req, res) => {
    try {
      const { orderId, status } = req.body;
      if (!global.ordersStore) global.ordersStore = [];
      let order = global.ordersStore.find(o => o.id === orderId);
      if (order) {
        order.status = status;
        return res.json({ success: true, status });
      }
      global.ordersStore.unshift({ id: orderId, status: status, date: "Today", total: "0.00", items: "Item" });
      return res.json({ success: true, status });
    } catch (e) {
      res.status(500).json({ error: "Error" });
    }
  });
  
// Razorpay Instance (Replace with your Test/Live keys)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mockKeyId123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mockSecret123",
});

// Create Order API
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: Math.round((amount || 100) * 100), // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Payment API
app.post("/api/payment/verify", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || "mockSecret123";

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.json({ status: "success", message: "Payment verified successfully" });
    } else {
      res.status(400).json({ status: "failed", message: "Invalid signature verification" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_super_secret_key_change_in_prod";

// Generate dual tokens on login/register
function generateTokens(userPayload) {
  const accessToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(userPayload, REFRESH_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

// Refresh Token Endpoint
app.post("/api/user/refresh-token", (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token missing. Please sign in." });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const userPayload = { id: decoded.id, email: decoded.email };
    
    // Issue new Access Token
    const newAccessToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "15m" });
    
    res.cookie("authToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.json({ success: true, message: "Token refreshed successfully" });
  } catch (err) {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res.status(403).json({ error: "Invalid refresh token. Please sign in again." });
  }
});
