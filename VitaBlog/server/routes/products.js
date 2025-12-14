const express = require('express');
const { verifyToken, isAuthorOrAdmin } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

// GET /api/products - List all published products with pagination & search
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { isPublished: true };
    if (category) where.category = category;
    if (search) {
      where[db.sequelize.Op.or] = [
        { title: { [db.sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [{ model: db.User, attributes: ['firstName', 'lastName', 'profileImage'] }],
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
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:slug - Get single product with comments
router.get('/:slug', async (req, res) => {
  try {
    const product = await db.Product.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: db.User, attributes: ['id', 'firstName', 'lastName', 'profileImage', 'bio'] },
        { model: db.Comment, where: { status: 'approved' }, required: false, include: [{ model: db.User, attributes: ['firstName', 'lastName', 'profileImage'] }] }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await product.increment('views');

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products - Create new product (author/admin only)
router.post('/', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { title, description, content, category, price, image, benefits, specifications } = req.body;

    if (!title || !description || !content || !category) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate slug
    const slug = title.toLowerCase().replace(/\s+/g, '-').slice(0, 50);

    const product = await db.Product.create({
      authorId: req.user.id,
      title,
      slug: `${slug}-${Date.now()}`,
      description,
      content,
      category,
      price: parseFloat(price) || 0,
      image: image || null,
      benefits: benefits || [],
      specifications: specifications || {},
      isPublished: false,
      views: 0
    });

    res.status(201).json({
      message: 'Product created successfully (draft)',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check authorization
    if (product.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, content, category, price, image, benefits, specifications, isPublished } = req.body;

    await product.update({
      title: title || product.title,
      description: description || product.description,
      content: content || product.content,
      category: category || product.category,
      price: price !== undefined ? parseFloat(price) : product.price,
      image: image !== undefined ? image : product.image,
      benefits: benefits !== undefined ? benefits : product.benefits,
      specifications: specifications !== undefined ? specifications : product.specifications,
      isPublished: isPublished !== undefined ? isPublished : product.isPublished
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check authorization
    if (product.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/products/:id/comments - Add comment to product
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const comment = await db.Comment.create({
      postId: req.params.id,
      userId: req.user.id,
      content,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Comment submitted and awaiting approval',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

module.exports = router;
