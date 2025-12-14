const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

// POST /api/subscribers - Subscribe to blog
router.post('/', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await db.Subscriber.findOne({ where: { email } });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({ error: 'Email already subscribed' });
      } else {
        // Reactivate subscription
        await existingSubscriber.update({
          isActive: true,
          firstName: firstName || existingSubscriber.firstName,
          lastName: lastName || existingSubscriber.lastName,
          unsubscribedAt: null
        });
        return res.json({
          message: 'Subscription reactivated successfully',
          subscriber: existingSubscriber
        });
      }
    }

    // Create new subscriber
    const subscriber = await db.Subscriber.create({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      isActive: true
    });

    res.status(201).json({
      message: 'Successfully subscribed to blog',
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName
      }
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email already subscribed' });
    }
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// POST /api/subscribers/unsubscribe - Unsubscribe from blog
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const subscriber = await db.Subscriber.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found in subscribers list' });
    }

    if (!subscriber.isActive) {
      return res.json({ message: 'Already unsubscribed' });
    }

    await subscriber.update({
      isActive: false,
      unsubscribedAt: new Date()
    });

    res.json({ message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

// GET /api/subscribers - List all subscribers (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, active } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const { count, rows } = await db.Subscriber.findAndCountAll({
      where,
      order: [['subscribedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      subscribers: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
});

// GET /api/subscribers/count - Get subscriber count (admin only)
router.get('/count', verifyToken, isAdmin, async (req, res) => {
  try {
    const total = await db.Subscriber.count();
    const active = await db.Subscriber.count({ where: { isActive: true } });
    
    res.json({
      total,
      active,
      inactive: total - active
    });
  } catch (error) {
    console.error('Get subscriber count error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriber count' });
  }
});

module.exports = router;

