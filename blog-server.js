const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const blogPort = process.env.BLOG_PORT || 5000;
const DATA_DIR = path.join(__dirname, 'blog_data');
const APPOINTMENTS_FILE = path.join(__dirname, 'applications.json');

// Ensure blog_data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- Helper Functions ---
const readJSON = (filePath) => {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

const generateToken = (email) => {
  return crypto.randomBytes(32).toString('hex');
};

// --- Auth Routes ---
app.get('/api/auth/health', (req, res) => {
  res.json({ status: 'Auth service running' });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields required' });
    }
    
    const usersFile = path.join(DATA_DIR, 'users.json');
    const users = readJSON(usersFile);
    
    // Check if user exists
    if (users.some(u => u.email === email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Check if email is approved in appointments
    let isApproved = false;
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      try {
        const appointments = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
        isApproved = appointments.some(apt => apt.email === email && apt.status === 'approved');
      } catch (e) {
        // Continue anyway
      }
    }
    
    // Create user
    const user = {
      id: crypto.randomBytes(8).toString('hex'),
      email,
      password: Buffer.from(password).toString('base64'), // Simple encoding (use bcrypt in production)
      firstName,
      lastName,
      role: isApproved ? 'author' : 'viewer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    writeJSON(usersFile, users);
    
    const token = generateToken(email);
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const usersFile = path.join(DATA_DIR, 'users.json');
    const users = readJSON(usersFile);
    
    const user = users.find(u => u.email === email);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValidPassword = Buffer.from(password).toString('base64') === user.password;
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(email);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Products Routes ---
app.get('/api/products', (req, res) => {
  const productsFile = path.join(DATA_DIR, 'products.json');
  const products = readJSON(productsFile);
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const productsFile = path.join(DATA_DIR, 'products.json');
  const products = readJSON(productsFile);
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { title, description, price, category } = req.body;
  
  if (!title || !description || !price || !category) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  const productsFile = path.join(DATA_DIR, 'products.json');
  const products = readJSON(productsFile);
  
  const product = {
    id: crypto.randomBytes(8).toString('hex'),
    title,
    description,
    price,
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(product);
  writeJSON(productsFile, products);
  
  res.status(201).json(product);
});

// --- Opportunities Routes ---
app.get('/api/opportunities', (req, res) => {
  const oppsFile = path.join(DATA_DIR, 'opportunities.json');
  const opportunities = readJSON(oppsFile);
  res.json(opportunities);
});

app.get('/api/opportunities/:id', (req, res) => {
  const oppsFile = path.join(DATA_DIR, 'opportunities.json');
  const opportunities = readJSON(oppsFile);
  const opportunity = opportunities.find(o => o.id === req.params.id);
  
  if (!opportunity) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json(opportunity);
});

app.post('/api/opportunities', (req, res) => {
  const { title, description, commission, category } = req.body;
  
  if (!title || !description || !commission || !category) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  const oppsFile = path.join(DATA_DIR, 'opportunities.json');
  const opportunities = readJSON(oppsFile);
  
  const opportunity = {
    id: crypto.randomBytes(8).toString('hex'),
    title,
    description,
    commission,
    category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  opportunities.push(opportunity);
  writeJSON(oppsFile, opportunities);
  
  res.status(201).json(opportunity);
});

// --- Users Routes ---
app.get('/api/users/profile', (req, res) => {
  // In production, extract email from JWT token
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(401).json({ error: 'User email required' });
  }
  
  const usersFile = path.join(DATA_DIR, 'users.json');
  const users = readJSON(usersFile);
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  });
});

// --- Comments Routes ---
app.get('/api/comments', (req, res) => {
  const commentsFile = path.join(DATA_DIR, 'comments.json');
  const comments = readJSON(commentsFile);
  res.json(comments);
});

app.post('/api/comments', (req, res) => {
  const { content, productId, userId } = req.body;
  
  if (!content || !productId || !userId) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  const commentsFile = path.join(DATA_DIR, 'comments.json');
  const comments = readJSON(commentsFile);
  
  const comment = {
    id: crypto.randomBytes(8).toString('hex'),
    content,
    productId,
    userId,
    createdAt: new Date().toISOString()
  };
  
  comments.push(comment);
  writeJSON(commentsFile, comments);
  
  res.status(201).json(comment);
});

// Start server
app.listen(blogPort, () => {
  console.log(`\n✅ VitaBlog Backend running on http://localhost:${blogPort}`);
  console.log(`📁 Data stored in: ${DATA_DIR}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/products`);
  console.log(`  POST   /api/products`);
  console.log(`  GET    /api/opportunities`);
  console.log(`  POST   /api/opportunities`);
  console.log(`  GET    /api/comments`);
  console.log(`  POST   /api/comments\n`);
});
