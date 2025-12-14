const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { generateToken, verifyToken } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();
const APPOINTMENTS_FILE = path.join(__dirname, '../../appointments.json');

// GET /api/auth/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'Auth service running' });
});

// POST /api/auth/register - Register via appointments (My Appointments logic)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email is in appointments.json (approved user from VitaWell funnel)
    let isApproved = false;
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      try {
        const appointmentsData = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
        isApproved = appointmentsData.some(apt => apt.email === email && apt.status === 'approved');
      } catch (e) {
        // Appointments file parsing error - allow anyway
      }
    }

    // Create user with appropriate role
    const user = await db.User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: isApproved ? 'author' : 'viewer',
      isActive: true
    });

    // Generate token
    const token = generateToken(user);

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

// POST /api/auth/login - Login with email/password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await db.User.findOne({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

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

// POST /api/auth/email-auth - Email-based auth for "My Appointments" flow
router.post('/email-auth', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if email is in appointments.json with approved status
    if (!fs.existsSync(APPOINTMENTS_FILE)) {
      return res.status(404).json({ error: 'Email not found in appointments' });
    }

    const appointmentsData = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
    const appointment = appointmentsData.find(apt => apt.email === email);

    if (!appointment || appointment.status !== 'approved') {
      return res.status(404).json({ error: 'Email not found or not approved' });
    }

    // Find or create user
    let user = await db.User.findOne({ where: { email } });
    if (!user) {
      user = await db.User.create({
        email,
        firstName: appointment.name?.split(' ')[0] || 'User',
        lastName: appointment.name?.split(' ')[1] || 'Member',
        role: 'author',
        isActive: true,
        password: await bcrypt.hash(Math.random().toString(36), 10)
      });
    }

    const token = generateToken(user);

    res.json({
      message: 'Email authentication successful',
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
    console.error('Email auth error:', error);
    res.status(500).json({ error: 'Email authentication failed' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      bio: user.bio,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, profileImage } = req.body;
    const user = await db.User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      bio: bio || user.bio,
      profileImage: profileImage || user.profileImage
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/logout - Logout (client-side removes token)
router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful. Please remove your token on the client side.' });
});

module.exports = router;
