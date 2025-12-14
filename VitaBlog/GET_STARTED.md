# 🚀 Get Started with VitaBlog

Welcome! This guide will help you set up and run your fully functional blog in minutes.

## Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
cd VitaBlog
npm install
```

### Step 2: Initialize & Setup
```bash
npm run setup
```

This will:
- Create a `.env` file with your configuration
- Set up the database
- Create sample data (posts, users, products)

**OR** run manually:
```bash
npm run init        # Interactive setup
npm run db:migrate  # Create database tables
npm run db:seed     # Add sample data
```

### Step 3: Start the Server
```bash
npm run server:dev
```

Open http://localhost:5001 in your browser! 🎉

---

## What You Get

### Sample Accounts (after seeding)
- **Admin**: `admin@vitablog.co` / `admin123`
- **Author**: `author@vitablog.co` / `author123`

### Sample Content
- 3 blog posts ready to view
- 3 products
- 2 opportunities
- Sample subscribers

---

## Database Setup Options

### Option A: Use Docker (Easiest)
```bash
docker-compose up -d
```
Then run: `npm run db:migrate && npm run db:seed`

### Option B: Local PostgreSQL
1. Install PostgreSQL
2. Create database: `createdb vitablog`
3. Update `.env` with your credentials
4. Run: `npm run db:migrate && npm run db:seed`

### Option C: No Database? (Development Only)
The app will show helpful error messages and guide you to set up the database.

---

## Features Available

✅ **Blog Posts** - Create, edit, delete posts with images  
✅ **Comments** - Users can comment (requires approval)  
✅ **Subscribers** - Email subscription system  
✅ **Social Sharing** - Share posts on Facebook, Twitter, LinkedIn, WhatsApp  
✅ **Image Uploads** - Upload featured images for posts  
✅ **User Management** - Admin, Author, Viewer roles  
✅ **Products & Opportunities** - Full CRUD operations  

---

## Troubleshooting

### Port 5001 already in use?
Change the port in `.env`:
```
PORT=5002
```

### Database connection failed?
1. Check PostgreSQL is running
2. Verify `.env` credentials
3. Try Docker: `docker-compose up -d`

### No posts showing?
Run the seeder:
```bash
npm run db:seed
```

---

## Next Steps

1. **Customize**: Edit posts, add your own content
2. **Configure**: Update `.env` with your settings
3. **Deploy**: Ready for production deployment
4. **Extend**: Add more features as needed

---

## Need Help?

- Check `README.md` for detailed documentation
- See `BLOG_FEATURES.md` for feature list
- Review `QUICKSTART.md` for advanced setup

**Happy Blogging!** 🎉

