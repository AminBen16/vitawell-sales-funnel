#!/usr/bin/env node

/**
 * Verify Setup Script
 * Checks if everything is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VitaBlog Setup Verification\n');

let allGood = true;

// Check .env file
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found');
  console.log('   Run: npm run init');
  allGood = false;
} else {
  console.log('✅ .env file exists');
}

// Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ node_modules not found');
  console.log('   Run: npm install');
  allGood = false;
} else {
  console.log('✅ Dependencies installed');
}

// Check uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  console.log('⚠️  uploads directory not found (will be created automatically)');
} else {
  console.log('✅ uploads directory exists');
}

// Try to connect to database
console.log('\n📊 Testing database connection...');
try {
  require('dotenv').config();
  const db = require('./server/database');
  
  db.sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connection successful');
      
      // Check for tables
      db.sequelize.getQueryInterface().showAllTables()
        .then(tables => {
          if (tables.length > 0) {
            console.log(`✅ Database tables exist (${tables.length} tables)`);
            
            // Check for data
            db.User.count()
              .then(userCount => {
                if (userCount > 0) {
                  console.log(`✅ Sample data found (${userCount} users)`);
                  console.log('\n🎉 Everything looks good!');
                  console.log('\n📝 Next steps:');
                  console.log('   1. Start server: npm run server:dev');
                  console.log('   2. Open http://localhost:5001');
                  console.log('   3. Sign in with: admin@vitablog.co / admin123');
                  process.exit(0);
                } else {
                  console.log('⚠️  No users found');
                  console.log('   Run: npm run db:seed');
                  process.exit(0);
                }
              })
              .catch(() => {
                console.log('⚠️  Could not check for data');
                process.exit(0);
              });
          } else {
            console.log('⚠️  No database tables found');
            console.log('   Run: npm run db:migrate');
            process.exit(0);
          }
        })
        .catch(() => {
          console.log('⚠️  Could not check tables');
          process.exit(0);
        });
    })
    .catch(error => {
      console.log('❌ Database connection failed');
      console.log('   Error:', error.message);
      console.log('\n💡 Solutions:');
      console.log('   1. Make sure PostgreSQL is running');
      console.log('   2. Check your .env file credentials');
      console.log('   3. Or use Docker: docker-compose up -d');
      process.exit(1);
    });
} catch (error) {
  console.log('❌ Could not test database');
  console.log('   Error:', error.message);
  allGood = false;
  process.exit(1);
}

