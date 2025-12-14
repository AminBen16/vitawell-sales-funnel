const express = require('express');
const { verifyToken, isAuthorOrAdmin } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

// GET /api/opportunities - List opportunities with filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, type, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (type) where.type = type;
    if (search) {
      where[db.sequelize.Op.or] = [
        { title: { [db.sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Opportunity.findAndCountAll({
      where,
      include: [{ model: db.User, as: 'author', attributes: ['firstName', 'lastName', 'profileImage'] }],
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
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

// GET /api/opportunities/:slug - Get single opportunity
router.get('/:slug', async (req, res) => {
  try {
    const opportunity = await db.Opportunity.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: db.User, attributes: ['id', 'firstName', 'lastName', 'profileImage', 'bio'] }
      ]
    });

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Increment view count
    await opportunity.increment('views');

    res.json(opportunity);
  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

// POST /api/opportunities - Create opportunity (author/admin)
router.post('/', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { title, description, content, type, image, requirements, benefits, earnings } = req.body;

    if (!title || !description || !content || !type) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

    const opportunity = await db.Opportunity.create({
      authorId: req.user.id,
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      content,
      type,
      image: image || null,
      requirements: requirements || [],
      benefits: benefits || [],
      earnings: earnings || {},
      isActive: false,
      views: 0
    });

    res.status(201).json({
      message: 'Opportunity created successfully (draft)',
      opportunity
    });
  } catch (error) {
    console.error('Create opportunity error:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

// PUT /api/opportunities/:id - Update opportunity
router.put('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const opportunity = await db.Opportunity.findByPk(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, content, type, image, requirements, benefits, earnings, isActive } = req.body;

    await opportunity.update({
      title: title || opportunity.title,
      description: description || opportunity.description,
      content: content || opportunity.content,
      type: type || opportunity.type,
      image: image !== undefined ? image : opportunity.image,
      requirements: requirements !== undefined ? requirements : opportunity.requirements,
      benefits: benefits !== undefined ? benefits : opportunity.benefits,
      earnings: earnings !== undefined ? earnings : opportunity.earnings,
      isActive: isActive !== undefined ? isActive : opportunity.isActive
    });

    res.json({
      message: 'Opportunity updated successfully',
      opportunity
    });
  } catch (error) {
    console.error('Update opportunity error:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

// DELETE /api/opportunities/:id - Delete opportunity
router.delete('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const opportunity = await db.Opportunity.findByPk(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    if (opportunity.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await opportunity.destroy();

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Delete opportunity error:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

module.exports = router;
