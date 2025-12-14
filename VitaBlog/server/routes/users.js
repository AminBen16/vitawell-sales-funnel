const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

// GET /api/users/:id - Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
      attributes: ['id', 'firstName', 'lastName', 'email', 'bio', 'profileImage', 'role'],
      include: [
        { model: db.Product, attributes: ['id', 'title', 'slug', 'image', 'createdAt'], where: { isPublished: true }, required: false }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:id/products - Get user's published products
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Product.findAndCountAll({
      where: {
        authorId: req.params.id,
        isPublished: true
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false
    });

    res.json({
      products: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({ error: 'Failed to fetch user products' });
  }
});

// GET /api/users/:id/opportunities - Get user's active opportunities
router.get('/:id/opportunities', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Opportunity.findAndCountAll({
      where: {
        authorId: req.params.id,
        isActive: true
      },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false
    });

    res.json({
      opportunities: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get user opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch user opportunities' });
  }
});

// GET /api/users - List all users (admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.User.findAndCountAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id - Update user profile (owner or admin)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, bio, profileImage, role, isActive } = req.body;

    // Only admin can change role or active status
    const updateData = {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      bio: bio || user.bio,
      profileImage: profileImage || user.profileImage
    };

    if (req.user.role === 'admin') {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    await user.update(updateData);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user account (owner or admin)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check authorization
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await db.User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
