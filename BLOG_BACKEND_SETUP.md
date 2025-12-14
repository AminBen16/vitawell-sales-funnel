# VitaBlog Backend - JSON File-Based Alternative

## ✅ Backend Created (No Docker/Database Required)

### Server Setup
- **File:** `blog-server.js`
- **Port:** 5000
- **Storage:** JSON files in `blog_data/` directory
- **Start Command:** `node blog-server.js`

### Key Features
✅ User registration/login  
✅ Products CRUD  
✅ Opportunities CRUD  
✅ Comments system  
✅ Auto-checks appointments.json for "approved" status → grants "author" role  
✅ CORS enabled for frontend integration  

### API Endpoints

#### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login with email/password
GET    /api/auth/health            - Health check
```

#### Products
```
GET    /api/products               - List all products
GET    /api/products/:id           - Get product by ID
POST   /api/products               - Create new product
```

#### Opportunities
```
GET    /api/opportunities          - List all opportunities
GET    /api/opportunities/:id      - Get opportunity by ID
POST   /api/opportunities          - Create new opportunity
```

#### Users
```
GET    /api/users/profile          - Get current user profile
```

#### Comments
```
GET    /api/comments               - List all comments
POST   /api/comments               - Create new comment
```

### Data Storage
All data stored in JSON files:
```
blog_data/
├── users.json
├── products.json
├── opportunities.json
└── comments.json
```

### How to Run

**Option 1: Run blog server only**
```bash
node blog-server.js
```

**Option 2: Run both funnel and blog servers**
```bash
npm run dev  # Requires 'concurrently' package
```

**Option 3: Run funnel server separately**
```bash
npm start              # Terminal 1 - Port 3000
node blog-server.js    # Terminal 2 - Port 5000
```

### Integration with VitaWell Funnel

1. **Funnel Server:** Running on `http://localhost:3000`
2. **Blog Server:** Running on `http://localhost:5000`
3. **Appointments Flow:**
   - User submits appointment via VitaWell funnel form
   - Data saved to `applications.json` with `status: "received"`
   - When admin approves (changes status to `"approved"`), user can:
     - Register in VitaBlog with same email
     - Automatically becomes "author" role
     - Can create products, opportunities, comments

### Frontend Connection
Update your blog frontend (HTML/React) to point to:
```
http://localhost:5000/api/...
```

### Example Usage

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Create Product:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Product Name",
    "description": "Product description",
    "price": 99.99,
    "category": "Formula"
  }'
```

### Production Considerations
- Replace `Buffer.from(password).toString('base64')` with bcryptjs for real encryption
- Use JWT tokens instead of simple hex tokens
- Add input validation and sanitization
- Set up proper environment variables
- Add rate limiting and security headers
- Use HTTPS for production
