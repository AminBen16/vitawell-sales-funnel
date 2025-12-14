const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'vitablog',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./models/User')(sequelize);
const Product = require('./models/Product')(sequelize);
const Opportunity = require('./models/Opportunity')(sequelize);
const Comment = require('./models/Comment')(sequelize);
const Post = require('./models/Post')(sequelize);
const Subscriber = require('./models/Subscriber')(sequelize);
const VerificationCode = require('./models/VerificationCode')(sequelize);

// Define associations
User.hasMany(Product, { foreignKey: 'authorId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Opportunity, { foreignKey: 'authorId', as: 'opportunities' });
Opportunity.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Product.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Product, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// Sync database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced');
    
    // Check if we need to seed
    const userCount = await sequelize.models.User.count();
    if (userCount === 0) {
      console.log('📝 No users found. Run "node scripts/seed.js" to create sample data.');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check your .env file has correct database credentials');
    console.error('   3. Or use Docker: docker-compose up -d');
    console.error('\n   Error details:', error.message);
    // Don't exit - let the server start anyway for development
    // process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  initializeDatabase();
}

module.exports = {
  sequelize,
  User,
  Product,
  Opportunity,
  Comment,
  Post,
  Subscriber,
  VerificationCode
};
