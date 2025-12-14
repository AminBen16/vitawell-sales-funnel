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

// Define associations
User.hasMany(Product, { foreignKey: 'authorId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

User.hasMany(Opportunity, { foreignKey: 'authorId', as: 'opportunities' });
Opportunity.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Product.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Comment.belongsTo(Product, { foreignKey: 'postId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });

// Sync database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
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
  Comment
};
