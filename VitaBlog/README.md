# VitaBlog - Full-Stack Blog Platform

## Overview
VitaBlog is a professional, SEO-optimized blog and CMS platform for posting wellness products and income opportunities. Built with modern technologies and designed for scalability.

## Tech Stack
- **Backend:** Node.js, Express.js, PostgreSQL, Sequelize ORM
- **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript
- **Authentication:** JWT + bcryptjs (with "My Appointments" email auth from VitaWell)
- **Security:** Helmet, CORS, Rate Limiting
- **File Uploads:** Multer for product/opportunity images

## Features
✅ **Product Management** - Create, edit, publish products with JSONB specifications  
✅ **Opportunity Posting** - Post income opportunities with benefits and earnings info  
✅ **User Authentication** - Email-based login via VitaWell appointments or standard registration  
✅ **Role-Based Access** - Admin, Author, Viewer roles with permission controls  
✅ **Comment Moderation** - Comments require approval before publishing  
✅ **SEO Optimized** - Rich meta tags, schema markup, canonical URLs, structured data  
✅ **Admin Dashboard** - Analytics, content management, user management  
✅ **Rate Limiting** - Protection against abuse (100 requests per 15 minutes)  

## Installation

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- npm or yarn

### Backend Setup
```bash
cd VitaBlog
npm install
```

### Environment Configuration
Create a `.env` file in the root:
```
NODE_ENV=development
PORT=5000
DB_NAME=vitablog
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
```

### Database Setup
```bash
npm run db:migrate    # Run migrations
npm run db:seed       # Seed sample data
```

### Start Development Server
```bash
npm run dev            # Runs backend + frontend concurrently
# Or individually:
npm run server:dev     # Backend only
npm run client:dev     # Frontend only (if using React)
```

## API Documentation

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/email-auth` - Login via VitaWell appointment email
- `GET /api/auth/profile` - Get user profile (requires token)
- `PUT /api/auth/profile` - Update profile (requires token)

### Products Routes
- `GET /api/products` - List products (paginated, searchable)
- `GET /api/products/:slug` - Get single product
- `POST /api/products` - Create product (author/admin only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/comments` - Add comment

### Opportunities Routes
- `GET /api/opportunities` - List opportunities
- `GET /api/opportunities/:slug` - Get single opportunity
- `POST /api/opportunities` - Create opportunity
- `PUT /api/opportunities/:id` - Update opportunity
- `DELETE /api/opportunities/:id` - Delete opportunity

### Users Routes
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/products` - Get user's products
- `GET /api/users/:id/opportunities` - Get user's opportunities
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## SEO Optimization

### Meta Tags
- Open Graph tags for social sharing
- Twitter Card meta tags
- Descriptive meta descriptions
- Keyword-optimized titles
- Canonical URLs

### Schema Markup
- Organization schema with founder info
- WebSite schema for search functionality
- Article/Product schema for content

### Sitemap & Robots.txt
```
robots.txt - Controls search engine crawling
sitemap.xml - Lists all indexable URLs
```

## Database Models

### User
- UUID primary key
- Email (unique)
- Hashed password
- Role: admin/author/viewer
- Profile: firstName, lastName, bio, profileImage

### Product
- Title, slug (unique), description, content
- Category, price, image
- Benefits (JSONB array)
- Specifications (JSONB object)
- View counter
- Published status

### Opportunity
- Title, slug, description, content
- Type: partnership/affiliate/investment/collaboration
- Requirements, benefits, earnings (JSONB)
- Active status, view counter

### Comment
- Content, status (approved/pending/rejected)
- Associated with Product or Opportunity
- User attribution
- Timestamp

## Security Best Practices

1. **Authentication** - JWT tokens with 7-day expiry
2. **Authorization** - Role-based access control (RBAC)
3. **Password Hashing** - bcryptjs with 10 salt rounds
4. **CORS** - Restricted to CLIENT_URL
5. **Helmet** - Secure HTTP headers
6. **Rate Limiting** - 100 requests per 15 minutes
7. **Data Validation** - Input validation on all endpoints
8. **SQL Injection** - Sequelize parameterized queries

## Deployment

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Configure PostgreSQL credentials
- [ ] Set CLIENT_URL to production domain
- [ ] Enable HTTPS
- [ ] Set up proper logging
- [ ] Configure database backups
- [ ] Use environment variables (never commit .env)

### Deployment Platforms
- **Heroku** - `git push heroku main`
- **DigitalOcean** - App Platform
- **AWS** - EC2 + RDS
- **Google Cloud** - App Engine + Cloud SQL
- **Vercel** - App Platform for the application, paired with Vercel Postgres for the database.
- **Azure** - App Service + PostgreSQL

## Development Roadmap

### Phase 1 (Current)
- ✅ Core backend architecture
- ✅ Authentication system
- ✅ Product/Opportunity CRUD
- ✅ Basic frontend

### Phase 2
- [ ] React frontend rebuild
- [ ] Advanced admin dashboard with analytics
- [ ] Cloud file uploads (e.g., S3, Cloudinary)
- [ ] Email notifications

### Phase 3
- [ ] Advanced search & filters
- [ ] User recommendations
- [ ] Analytics dashboard
- [ ] Mobile app

### Phase 4
- [ ] Payment integration
- [ ] Subscription system
- [ ] Community features
- [ ] Live chat support

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

Proprietary - VitaWell.Co

## Support

For issues and support:
- Email: support@vitablog.co
- WhatsApp: +256700239737
- Website: https://vitawell.co

---

**Built by AINAMANI BENJAMIN - ICT Educator & Entrepreneur**
