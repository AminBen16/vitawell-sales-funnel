const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAuthorOrAdmin } = require('../middleware/auth');
const db = require('../database');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/posts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// GET /api/posts - List all published posts with pagination & search
router.get('/', async (req, res) => {
  try {
    console.log('📝 GET /api/posts - Request received');
    const { page = 1, limit = 12, category, search, tag } = req.query;
    const offset = (page - 1) * limit;

    const where = { isPublished: true };
    if (category) where.category = category;
    if (tag) where.tags = { [db.sequelize.Op.contains]: [tag] };
    if (search) {
      where[db.sequelize.Op.or] = [
        { title: { [db.sequelize.Op.iLike]: `%${search}%` } },
        { excerpt: { [db.sequelize.Op.iLike]: `%${search}%` } },
        { content: { [db.sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    console.log('📝 Querying posts with where:', where);
    const { count, rows } = await db.Post.findAndCountAll({
      where,
      include: [{ 
        model: db.User, 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        as: 'author'
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false
    });

    console.log(`📝 Found ${count} posts, returning ${rows.length}`);
    res.json({
      posts: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get posts error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
  }
});

// GET /api/posts/all - Get all posts (including drafts) for admin/author
router.get('/all', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    // If not admin, only show own posts
    if (req.user.role !== 'admin') {
      where.authorId = req.user.id;
    }

    const { count, rows } = await db.Post.findAndCountAll({
      where,
      include: [{ 
        model: db.User, 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        as: 'author'
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      subQuery: false
    });

    res.json({
      posts: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// GET /api/posts/:slug - Get single post with comments
router.get('/:slug', async (req, res) => {
  try {
    const post = await db.Post.findOne({
      where: { slug: req.params.slug },
      include: [
        { 
          model: db.User, 
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'bio'],
          as: 'author'
        },
        { 
          model: db.Comment, 
          where: { status: 'approved' }, 
          required: false, 
          include: [{ 
            model: db.User, 
            attributes: ['id', 'firstName', 'lastName', 'profileImage'],
            as: 'author'
          }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only increment views for published posts
    if (post.isPublished) {
      await post.increment('views');
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// POST /api/posts - Create new post (author/admin only)
router.post('/', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, isPublished, featuredImage } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Generate slug
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50);
    const slug = `${baseSlug}-${Date.now()}`;

    const post = await db.Post.create({
      authorId: req.user.id,
      title,
      slug,
      excerpt: excerpt || content.substring(0, 200),
      content,
      category: category || 'general',
      tags: tags || [],
      featuredImage: featuredImage || null,
      isPublished: isPublished || false,
      views: 0
    });

    const postWithAuthor = await db.Post.findByPk(post.id, {
      include: [{ 
        model: db.User, 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        as: 'author'
      }]
    });

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithAuthor
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, excerpt, content, category, tags, isPublished, featuredImage } = req.body;

    // Update slug if title changed
    let slug = post.slug;
    if (title && title !== post.title) {
      const baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50);
      slug = `${baseSlug}-${Date.now()}`;
    }

    await post.update({
      title: title || post.title,
      slug,
      excerpt: excerpt !== undefined ? excerpt : post.excerpt,
      content: content || post.content,
      category: category || post.category,
      tags: tags !== undefined ? tags : post.tags,
      featuredImage: featuredImage !== undefined ? featuredImage : post.featuredImage,
      isPublished: isPublished !== undefined ? isPublished : post.isPublished
    });

    const updatedPost = await db.Post.findByPk(post.id, {
      include: [{ 
        model: db.User, 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        as: 'author'
      }]
    });

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/posts/:id - Delete post
router.delete('/:id', verifyToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete featured image if exists
    if (post.featuredImage) {
      const imagePath = path.join(__dirname, '../../', post.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await post.destroy();

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/posts/:id/image - Upload featured image for post
router.post('/:id/image', verifyToken, isAuthorOrAdmin, upload.single('image'), async (req, res) => {
  try {
    const post = await db.Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check authorization
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Delete old image if exists
    if (post.featuredImage) {
      const oldImagePath = path.join(__dirname, '../../', post.featuredImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const imageUrl = `/uploads/posts/${req.file.filename}`;
    await post.update({ featuredImage: imageUrl });

    res.json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/posts/:id/comments - Add comment to post
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content required' });
    }

    const post = await db.Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await db.Comment.create({
      postId: req.params.id,
      userId: req.user.id,
      content,
      status: 'pending'
    });

    const commentWithAuthor = await db.Comment.findByPk(comment.id, {
      include: [{ 
        model: db.User, 
        attributes: ['id', 'firstName', 'lastName', 'profileImage'],
        as: 'author'
      }]
    });

    res.status(201).json({
      message: 'Comment submitted and awaiting approval',
      comment: commentWithAuthor
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

module.exports = router;

