/**
 * McClean — Production Node.js Backend
 * Deploy on OVH VPS with Node.js 18+
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting (simple in-memory)
const rateMap = new Map();
function rateLimit(maxReq = 10, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = rateMap.get(ip) || { count: 0, start: now };
    if (now - record.start > windowMs) {
      record.count = 1; record.start = now;
    } else {
      record.count++;
    }
    rateMap.set(ip, record);
    if (record.count > maxReq) {
      return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }
    next();
  };
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ─── INPUT VALIDATION ─────────────────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, '').slice(0, 200);
}
function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── BOOKING API ──────────────────────────────────────────────────────────────
app.post('/api/book', rateLimit(5, 60000), (req, res) => {
  const { service, postcode, date, email } = req.body;

  // Validate
  if (!service || !postcode || !date || !email) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const booking = {
    id: crypto.randomUUID(),
    service: sanitize(service),
    postcode: sanitize(postcode),
    date: sanitize(date),
    email: sanitize(email),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // Save to JSON file (replace with DB in production)
  const file = path.join(DATA_DIR, 'bookings.json');
  const bookings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  bookings.push(booking);
  fs.writeFileSync(file, JSON.stringify(bookings, null, 2));

  console.log(`[BOOKING] ${booking.id} — ${booking.service} @ ${booking.postcode}`);

  res.status(201).json({
    success: true,
    bookingId: booking.id,
    message: 'Booking received. Check your email for available cleaners.'
  });
});

// ─── CLEANER APPLICATION API ──────────────────────────────────────────────────
app.post('/api/apply', rateLimit(3, 60000), (req, res) => {
  const { name, email, phone, city } = req.body;

  if (!name || !email || !phone || !city) {
    return res.status(400).json({ error: 'All fields required.' });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const application = {
    id: crypto.randomUUID(),
    name: sanitize(name),
    email: sanitize(email),
    phone: sanitize(phone),
    city: sanitize(city),
    status: 'pending_review',
    createdAt: new Date().toISOString()
  };

  const file = path.join(DATA_DIR, 'applications.json');
  const apps = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  apps.push(application);
  fs.writeFileSync(file, JSON.stringify(apps, null, 2));

  console.log(`[APPLY] ${application.id} — ${application.name} @ ${application.city}`);

  res.status(201).json({
    success: true,
    applicationId: application.id,
    message: 'Application received. We\'ll be in touch within 24 hours.'
  });
});

// ─── ADMIN API (basic auth protected) ────────────────────────────────────────
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'changeme123';

function adminAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  if (token !== ADMIN_PASS) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const file = path.join(DATA_DIR, 'bookings.json');
  const bookings = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  res.json({ count: bookings.length, bookings });
});

app.get('/api/admin/applications', adminAuth, (req, res) => {
  const file = path.join(DATA_DIR, 'applications.json');
  const apps = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : [];
  res.json({ count: apps.length, applications: apps });
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── CATCH-ALL (SPA) ──────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`McClean server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
