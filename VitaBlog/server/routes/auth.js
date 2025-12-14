const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const passport = require('../config/passport');
const { generateToken, verifyToken } = require('../middleware/auth');
const db = require('../database');
const { sendVerificationCode } = require('../services/emailService');

const router = express.Router();
// Check for applications.json or appointments.json in root directory (VitaWell_Funnel)
const rootApplications = path.join(__dirname, '../../../applications.json');
const rootAppointments = path.join(__dirname, '../../../appointments.json');
const localAppointments = path.join(__dirname, '../../appointments.json');

// Use applications.json (from funnel) if it exists, otherwise try appointments.json
let APPOINTMENTS_FILE;
if (fs.existsSync(rootApplications)) {
  APPOINTMENTS_FILE = rootApplications;
} else if (fs.existsSync(rootAppointments)) {
  APPOINTMENTS_FILE = rootAppointments;
} else {
  APPOINTMENTS_FILE = localAppointments;
}

// GET /api/auth/health - Health check
router.get('/health', (req, res) => {
  res.json({ status: 'Auth service running' });
});

// POST /api/auth/register - Register and send verification code
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

    // Check if there's a pending verification code for this email
    const existingCode = await db.VerificationCode.findOne({
      where: {
        email,
        type: 'signup',
        verified: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if email is in applications.json or appointments.json (approved user from VitaWell funnel)
    let isApproved = false;
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      try {
        const appointmentsData = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
        isApproved = appointmentsData.some(apt => {
          if (apt.email === email) {
            return apt.status === 'approved' || !apt.hasOwnProperty('status');
          }
          return false;
        });
      } catch (e) {
        console.error('Error reading appointments file:', e.message);
      }
    }

    // Store user data and verification code
    if (existingCode) {
      // Update existing code
      await existingCode.update({
        code,
        expiresAt,
        userData: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: isApproved ? 'author' : 'viewer'
        },
        attempts: 0
      });
    } else {
      // Create new verification code
      await db.VerificationCode.create({
        email,
        code,
        type: 'signup',
        expiresAt,
        userData: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: isApproved ? 'author' : 'viewer'
        }
      });
    }

    // Send verification email
    try {
      await sendVerificationCode(email, code, firstName);
      res.status(200).json({
        message: 'Verification code sent to your email. Please check your inbox and enter the code to complete registration.',
        email: email,
        expiresIn: 10 // minutes
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/verify-code - Verify email code and complete registration/login
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find verification code
    const verification = await db.VerificationCode.findOne({
      where: {
        email,
        code,
        verified: false
      },
      order: [['createdAt', 'DESC']]
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if code is expired
    if (new Date() > verification.expiresAt) {
      await verification.update({ verified: true }); // Mark as used
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempts (max 5 attempts)
    if (verification.attempts >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new verification code.' });
    }

    // Verify the code
    if (verification.code !== code) {
      await verification.update({ attempts: verification.attempts + 1 });
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Mark as verified
    await verification.update({ verified: true });

    // Handle based on type
    if (verification.type === 'signup' && verification.userData) {
      // Complete registration - create user
      const userData = verification.userData;
      
      // Double-check user doesn't exist (race condition protection)
      let user = await db.User.findOne({ where: { email } });
      if (user) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create user
      user = await db.User.create({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'viewer',
        isActive: true
      });

      // Generate token
      const token = generateToken(user);

      res.json({
        message: 'Email verified and account created successfully!',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } else if (verification.type === 'login') {
      // Email-based login verification
      let user = await db.User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found. Please register first.' });
      }

      const token = generateToken(user);
      res.json({
        message: 'Email verified and signed in successfully!',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid verification type' });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/resend-code - Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find existing verification code
    const existingCode = await db.VerificationCode.findOne({
      where: {
        email,
        verified: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['createdAt', 'DESC']]
    });

    if (existingCode) {
      // Check if we can resend (rate limiting: max 1 resend per 2 minutes)
      const timeSinceCreation = Date.now() - new Date(existingCode.createdAt).getTime();
      if (timeSinceCreation < 2 * 60 * 1000) {
        return res.status(429).json({ 
          error: 'Please wait before requesting a new code. Check your email or try again in a moment.' 
        });
      }
    }

    // Generate new code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (existingCode && existingCode.userData) {
      // Update existing code
      await existingCode.update({
        code,
        expiresAt,
        attempts: 0
      });

      // Send email
      await sendVerificationCode(email, code, existingCode.userData.firstName || 'User');
    } else {
      // Check if user exists (for login resend)
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'No pending verification found. Please register first.' });
      }

      // Create new verification code for login
      await db.VerificationCode.create({
        email,
        code,
        type: 'login',
        expiresAt
      });

      await sendVerificationCode(email, code, user.firstName || 'User');
    }

    res.json({
      message: 'Verification code resent to your email.',
      email: email,
      expiresIn: 10
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Failed to resend verification code' });
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

    // Check if user has a password (OAuth users don't have passwords)
    if (!user.password) {
      return res.status(401).json({ error: 'This account uses OAuth login. Please sign in with your OAuth provider.' });
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

// POST /api/auth/email-auth - Email-based auth for "My Appointments" flow (sends verification code)
router.post('/email-auth', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Check if email is in applications.json or appointments.json
    if (!fs.existsSync(APPOINTMENTS_FILE)) {
      return res.status(404).json({ error: 'Email not found in applications. Please submit an application on VitaWell.Co first.' });
    }

    const appointmentsData = JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
    const appointment = appointmentsData.find(apt => apt.email === email);

    // For applications.json (no status field), any match is valid
    // For appointments.json (with status field), must be 'approved'
    if (!appointment) {
      return res.status(404).json({ error: 'Email not found. Please submit an application on VitaWell.Co first.' });
    }
    
    if (appointment.hasOwnProperty('status') && appointment.status !== 'approved') {
      return res.status(404).json({ error: 'Your application is pending approval. Please wait for approval before accessing the blog.' });
    }

    // Check if user exists
    let user = await db.User.findOne({ where: { email } });
    const firstName = user ? user.firstName : (appointment.name?.split(' ')[0] || 'User');

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check for existing verification code
    const existingCode = await db.VerificationCode.findOne({
      where: {
        email,
        type: 'login',
        verified: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (existingCode) {
      // Update existing code
      await existingCode.update({
        code,
        expiresAt,
        attempts: 0
      });
    } else {
      // Create new verification code
      await db.VerificationCode.create({
        email,
        code,
        type: 'login',
        expiresAt
      });
    }

    // Send verification email
    try {
      await sendVerificationCode(email, code, firstName);
      res.json({
        message: 'Verification code sent to your email. Please check your inbox and enter the code to sign in.',
        email: email,
        expiresIn: 10,
        userExists: !!user
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
    }
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

// ========== OAuth Routes ==========

// Google OAuth - Initiate login (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  // Google OAuth - Callback
  router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = generateToken(user);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5001';
        res.redirect(`${frontendUrl}/#login?token=${token}&email=${encodeURIComponent(user.email)}&oauth=google`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/login?error=oauth_callback_failed');
      }
    }
  );
} else {
  // Google OAuth not configured - return error
  router.get('/google', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.' });
  });
  
  router.get('/google/callback', (req, res) => {
    res.status(503).json({ error: 'Google OAuth is not configured.' });
  });
}

// GitHub OAuth - Initiate login (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

  // GitHub OAuth - Callback
  router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login?error=oauth_failed' }),
    async (req, res) => {
      try {
        const user = req.user;
        const token = generateToken(user);
        
        // Redirect to frontend with token
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5001';
        res.redirect(`${frontendUrl}/#login?token=${token}&email=${encodeURIComponent(user.email)}&oauth=github`);
      } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/login?error=oauth_callback_failed');
      }
    }
  );
} else {
  // GitHub OAuth not configured - return error
  router.get('/github', (req, res) => {
    res.status(503).json({ error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in your .env file.' });
  });
  
  router.get('/github/callback', (req, res) => {
    res.status(503).json({ error: 'GitHub OAuth is not configured.' });
  });
}

module.exports = router;
