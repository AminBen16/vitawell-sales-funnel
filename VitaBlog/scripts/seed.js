const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('../server/database');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await db.User.create({
      email: 'admin@vitablog.co',
      password: adminPassword,
      firstName: 'AINAMANI',
      lastName: 'BENJAMIN',
      role: 'admin',
      bio: 'Founder of VitaWell.Co | ICT Educator & Entrepreneur',
      isActive: true
    });

    // Create author user
    const authorPassword = await bcrypt.hash('author123', 10);
    const author = await db.User.create({
      email: 'author@vitablog.co',
      password: authorPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'author',
      bio: 'Health & Wellness Expert',
      isActive: true
    });

    // Create sample products
    const products = [
      {
        authorId: admin.id,
        title: 'Premium Wellness Bundle',
        slug: 'premium-wellness-bundle-' + Date.now(),
        description: 'Complete health transformation package',
        content: 'Our premium wellness bundle includes everything you need for optimal health.',
        category: 'wellness',
        price: 99.99,
        benefits: ['Better Energy', 'Improved Immunity', 'Mental Clarity'],
        specifications: { duration: '90 days', components: 5 },
        isPublished: true
      },
      {
        authorId: author.id,
        title: 'Natural Detox Program',
        slug: 'natural-detox-program-' + Date.now(),
        description: 'Scientifically-backed detoxification',
        content: 'Cleanse your body naturally with our proven detox program.',
        category: 'health',
        price: 49.99,
        benefits: ['Toxin Removal', 'Weight Loss', 'Better Digestion'],
        specifications: { type: 'herbal', days: 30 },
        isPublished: true
      },
      {
        authorId: admin.id,
        title: 'Fitness & Nutrition Guide',
        slug: 'fitness-nutrition-guide-' + Date.now(),
        description: 'Complete lifestyle transformation',
        content: 'Master fitness and nutrition with our comprehensive guide.',
        category: 'fitness',
        price: 0,
        benefits: ['Custom Workout Plans', 'Meal Prep Guides', 'Expert Support'],
        specifications: { modules: 12, formats: ['PDF', 'Video'] },
        isPublished: true
      }
    ];

    for (const product of products) {
      await db.Product.create(product);
    }

    // Create sample opportunities
    const opportunities = [
      {
        authorId: admin.id,
        title: 'Become a Wellness Partner',
        slug: 'become-wellness-partner-' + Date.now(),
        description: 'Join our collaborative income opportunity',
        content: 'Partner with us to share premium wellness products and earn recurring income.',
        type: 'partnership',
        requirements: ['Passion for wellness', 'Basic social media presence'],
        benefits: ['20-50% Commissions', 'Training & Support', 'Lifestyle Freedom'],
        earnings: { monthly_potential: '$500-$5000', type: 'recurring' },
        isActive: true
      },
      {
        authorId: author.id,
        title: 'Affiliate Marketing Program',
        slug: 'affiliate-marketing-program-' + Date.now(),
        description: 'Earn by promoting our products',
        content: 'Monetize your audience with our generous affiliate program.',
        type: 'affiliate',
        requirements: ['Website or Email List', 'Marketing Capability'],
        benefits: ['30% Commission', 'Marketing Materials', 'Dedicated Support'],
        earnings: { weekly_potential: '$100-$1000', type: 'commission' },
        isActive: true
      }
    ];

    for (const opportunity of opportunities) {
      await db.Opportunity.create(opportunity);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed
seed().then(() => process.exit(0));
