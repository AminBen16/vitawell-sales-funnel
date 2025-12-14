# VitaBlog - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd c:\Users\user\Desktop\VitaBlog
npm install
```

### Step 2: Setup PostgreSQL Database
You have two options:

**Option A: Using Docker (Easiest)**
```bash
docker-compose up -d
# This starts PostgreSQL on localhost:5432
```

**Option B: Local PostgreSQL**
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Create database: `createdb vitablog`
- Update `.env` with your credentials

### Step 3: Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your database credentials
```

### Step 4: Run Migrations & Seeds
```bash
npm run db:migrate    # Create database tables
npm run db:seed       # Add sample data
```

### Step 5: Start the Application
```bash
npm run dev           # Runs backend + frontend together
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:5000
- **PgAdmin:** http://localhost:5050 (admin@vitablog.co / admin)

---

## 📱 Testing the Features

### 1. Sign In with VitaWell Appointment
- Email: Use an email from VitaWell_Funnel's applications.json with status "approved"
- Click "Sign in with VitaWell Appointment"
- You'll be logged in automatically as an "author"

### 2. Create a Product
- Sign in (if not already)
- Go to Admin Dashboard
- Fill in product title and description
- Click "Create Product"

### 3. Create an Opportunity
- Go to Admin Dashboard
- Fill in opportunity title and description
- Click "Create Opportunity"
- Specify type: partnership, affiliate, investment, or collaboration

### 4. View Products & Opportunities
- Browse public products on Products page
- Browse opportunities on Opportunities page
- View author profiles

---

## 🔑 Default Credentials (After Seed)

**Admin Account:**
- Email: `admin@vitablog.co`
- Password: `admin123`
- Role: admin (full access)

**Author Account:**
- Email: `author@vitablog.co`
- Password: `author123`
- Role: author (create/manage own content)

---

## 🌐 API Endpoints Summary

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/password
POST   /api/auth/email-auth        - Login via VitaWell appointment
GET    /api/auth/profile           - Get current user
PUT    /api/auth/profile           - Update profile
```

### Products
```
GET    /api/products               - List all products
GET    /api/products/:slug         - Get single product
POST   /api/products               - Create product (requires token)
PUT    /api/products/:id           - Update product (owner/admin)
DELETE /api/products/:id           - Delete product (owner/admin)
POST   /api/products/:id/comments  - Add comment
```

### Opportunities
```
GET    /api/opportunities          - List all opportunities
GET    /api/opportunities/:slug    - Get single opportunity
POST   /api/opportunities          - Create opportunity (requires token)
PUT    /api/opportunities/:id      - Update opportunity
DELETE /api/opportunities/:id      - Delete opportunity
```

### Users
```
GET    /api/users/:id              - Get user profile
GET    /api/users/:id/products     - Get user's products
GET    /api/users/:id/opportunities - Get user's opportunities
GET    /api/users                  - List all users (admin only)
PUT    /api/users/:id              - Update user (owner/admin)
DELETE /api/users/:id              - Delete user (owner/admin)
```

---

## 🔐 Authentication Headers

For protected endpoints, include:
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGc..." \
     -H "Content-Type: application/json" \
     http://localhost:5000/api/auth/profile
```

---

## 📊 SEO Features

✅ **Meta Tags** - OG tags, Twitter cards, canonical URLs  
✅ **Schema Markup** - Organization & WebSite structured data  
✅ **Robots.txt** - Search engine guidelines  
✅ **Sitemap.xml** - URL discovery  
✅ **Keywords Optimized** - Product & opportunity descriptions  
✅ **Mobile Responsive** - Tailwind CSS mobile-first design  

---

## 🛠️ Development Tips

### Hot Reload
Both frontend and backend reload automatically when files change.

### Database Queries
Check `/server/models/` for data structure. Use Sequelize ORM methods.

### Error Logs
Check terminal output for detailed error messages. Set `NODE_ENV=development` for verbose logging.

### Testing API
Use curl or Postman:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Get Products
curl http://localhost:5000/api/products
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (API)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change PORT in .env
```

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DB credentials in .env
- Run: `psql -U postgres -h localhost -d vitablog`

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### JWT Token Expired
- Tokens expire after 7 days
- User must login again to get new token
- Change expiry in `/server/middleware/auth.js` if needed

---

## 📈 Next Steps

1. **Connect VitaWell_Funnel:** Sync appointments.json for email auth
2. **Configure Domain:** Update urls in .env for production
3. **Add Payment:** Integrate Stripe for paid products
4. **Email Notifications:** Setup SMTP for confirmations
5. **Analytics:** Add Google Analytics ID to frontend
6. **Deploy:** Use Docker Compose on your server

---

## 📞 Support

For questions or issues:
- Check README.md for comprehensive docs
- Review server logs for errors
- Check API responses for validation errors
- Ensure all environment variables are set

**Happy Blogging! 🎉**
