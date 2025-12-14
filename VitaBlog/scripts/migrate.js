const path = require('path');
const fs = require('fs');
const db = require('../server/database');

async function migrate() {
  try {
    console.log('🔄 Running migrations...');
    
    // Force sync in development - drops and recreates tables
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ force: false, alter: true });
      console.log('✅ Tables migrated (development mode)');
    } else {
      // In production, just sync without forcing
      await db.sequelize.sync({ force: false, alter: false });
      console.log('✅ Tables migrated (production mode)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate();
