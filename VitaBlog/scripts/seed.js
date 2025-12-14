const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('../server/database');

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Check if admin user already exists
    let admin = await db.User.findOne({ where: { email: 'admin@vitablog.co' } });
    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = await db.User.create({
        email: 'admin@vitablog.co',
        password: adminPassword,
        firstName: 'AINAMANI',
        lastName: 'BENJAMIN',
        role: 'admin',
        bio: 'Founder of VitaWell.Co | ICT Educator & Entrepreneur',
        isActive: true
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Check if author user already exists
    let author = await db.User.findOne({ where: { email: 'author@vitablog.co' } });
    if (!author) {
      const authorPassword = await bcrypt.hash('author123', 10);
      author = await db.User.create({
        email: 'author@vitablog.co',
        password: authorPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'author',
        bio: 'Health & Wellness Expert',
        isActive: true
      });
      console.log('✅ Author user created');
    } else {
      console.log('ℹ️  Author user already exists');
    }

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
      const existing = await db.Product.findOne({ where: { title: product.title } });
      if (!existing) {
        await db.Product.create(product);
      }
    }
    console.log('✅ Products checked/created');

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
      const existing = await db.Opportunity.findOne({ where: { title: opportunity.title } });
      if (!existing) {
        await db.Opportunity.create(opportunity);
      }
    }
    console.log('✅ Opportunities checked/created');

    // Create sample blog posts
    const posts = [
      {
        authorId: admin.id,
        title: 'Welcome to VitaBlog - Your Journey to Wellness Starts Here',
        slug: 'welcome-to-vitablog-' + Date.now(),
        excerpt: 'Discover how VitaBlog can transform your health and financial future through expert insights and proven strategies.',
        content: `# Welcome to VitaBlog

Welcome to VitaBlog, your comprehensive resource for health, wellness, and income opportunities. Founded by AINAMANI BENJAMIN, VitaBlog represents the fusion of expert knowledge, ethical business practices, and genuine care for your health and financial growth.

## What You'll Find Here

At VitaBlog, we're committed to providing you with:

- **Expert Health Insights**: Evidence-based articles on wellness, nutrition, and lifestyle
- **Premium Products**: Curated wellness products that have been tested and approved
- **Income Opportunities**: Legitimate ways to earn while helping others improve their health
- **Community Support**: Connect with like-minded individuals on similar journeys

## Our Mission

Our mission is simple: to empower you with the knowledge, tools, and opportunities you need to live your best life. Whether you're looking to improve your health, start a side business, or both, VitaBlog is here to support you every step of the way.

## Get Started

1. **Explore Our Blog**: Read our latest articles and insights
2. **Browse Products**: Discover wellness products that can transform your health
3. **Check Opportunities**: Explore ways to earn income while making a difference
4. **Subscribe**: Stay updated with our latest content and offers

Thank you for joining us on this journey. Together, we can achieve optimal health and financial freedom.

*— AINAMANI BENJAMIN, Founder*`,
        category: 'Welcome',
        tags: ['welcome', 'wellness', 'introduction'],
        isPublished: true,
        views: 0
      },
      {
        authorId: admin.id,
        title: '5 Essential Wellness Tips for a Healthier Lifestyle',
        slug: '5-essential-wellness-tips-' + Date.now(),
        excerpt: 'Learn five simple but powerful wellness tips that can transform your daily routine and improve your overall health.',
        content: `# 5 Essential Wellness Tips for a Healthier Lifestyle

Living a healthy lifestyle doesn't have to be complicated. Here are five essential tips that can make a significant difference in your overall wellness:

## 1. Stay Hydrated

Water is essential for every function in your body. Aim to drink at least 8 glasses of water daily. Start your day with a glass of water and keep a water bottle with you throughout the day.

## 2. Prioritize Sleep

Quality sleep is crucial for physical and mental health. Aim for 7-9 hours of sleep per night. Create a bedtime routine that helps you wind down and prepare for restful sleep.

## 3. Move Your Body Daily

You don't need to run a marathon every day. Even 30 minutes of moderate exercise can boost your energy, improve your mood, and support your overall health. Find activities you enjoy!

## 4. Eat Mindfully

Focus on whole, nutrient-dense foods. Fill your plate with colorful fruits and vegetables, lean proteins, and whole grains. Remember, it's about balance, not perfection.

## 5. Manage Stress

Chronic stress can negatively impact your health. Find healthy ways to manage stress, such as meditation, deep breathing, or spending time in nature.

## Conclusion

Small, consistent changes lead to big results. Start with one tip and gradually incorporate others into your routine. Your future self will thank you!`,
        category: 'Wellness',
        tags: ['wellness', 'health', 'lifestyle', 'tips'],
        isPublished: true,
        views: 0
      },
      {
        authorId: author.id,
        title: 'How to Build a Successful Wellness Business: A Complete Guide',
        slug: 'build-wellness-business-' + Date.now(),
        excerpt: 'Discover the step-by-step process of building a successful wellness business that helps others while generating income.',
        content: `# How to Build a Successful Wellness Business

Building a wellness business is not just about making money—it's about making a difference. Here's your complete guide to getting started.

## Step 1: Define Your Niche

The wellness industry is broad. Focus on a specific area where you have expertise or passion. This could be:
- Nutrition and meal planning
- Fitness and exercise
- Mental health and mindfulness
- Natural supplements
- Holistic health coaching

## Step 2: Build Your Knowledge Base

Invest in education and certifications. Your credibility is your currency in the wellness industry. Consider:
- Professional certifications
- Continuing education courses
- Industry conferences and workshops
- Mentorship programs

## Step 3: Create Valuable Content

Share your knowledge through:
- Blog posts and articles
- Social media content
- Video tutorials
- Email newsletters
- Free resources and guides

## Step 4: Build Your Network

Connect with:
- Other wellness professionals
- Potential clients
- Industry influencers
- Local health communities

## Step 5: Choose Your Business Model

Consider these options:
- **Coaching Services**: One-on-one or group coaching
- **Product Sales**: Curated wellness products
- **Affiliate Marketing**: Promote products you believe in
- **Online Courses**: Share your expertise at scale
- **Hybrid Model**: Combine multiple approaches

## Step 6: Launch and Iterate

Start small, gather feedback, and continuously improve. Remember, every successful business started with a single step.

## Conclusion

Building a wellness business takes time, dedication, and genuine care for your clients. Focus on providing value, and success will follow.`,
        category: 'Business',
        tags: ['business', 'wellness', 'entrepreneurship', 'income'],
        isPublished: true,
        views: 0
      }
    ];

    for (const post of posts) {
      const existing = await db.Post.findOne({ where: { title: post.title } });
      if (!existing) {
        await db.Post.create(post);
      }
    }
    console.log('✅ Blog posts checked/created');

    // Create sample subscribers
    const subscriber1 = await db.Subscriber.findOne({ where: { email: 'subscriber1@example.com' } });
    if (!subscriber1) {
      await db.Subscriber.create({
        email: 'subscriber1@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true
      });
    }

    const subscriber2 = await db.Subscriber.findOne({ where: { email: 'subscriber2@example.com' } });
    if (!subscriber2) {
      await db.Subscriber.create({
        email: 'subscriber2@example.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        isActive: true
      });
    }
    console.log('✅ Subscribers checked/created');

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Sample Accounts Created:');
    console.log('   Admin: admin@vitablog.co / admin123');
    console.log('   Author: author@vitablog.co / author123');
    console.log('\n🎉 Your blog is ready with sample content!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seed
seed().then(() => process.exit(0));
