const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'vita-blog-super-secret-key-change-in-production';

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is author or admin
const isAuthorOrAdmin = (req, res, next) => {
  if (!['admin', 'author'].includes(req.user?.role)) {
    return res.status(403).json({ error: 'Author or admin access required' });
  }
  next();
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  verifyToken,
  isAdmin,
  isAuthorOrAdmin,
  generateToken
};
