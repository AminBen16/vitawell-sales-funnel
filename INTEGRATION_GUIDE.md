# VitaWell Funnel & VitaBlog Integration Guide

## 🔗 How They're Linked

### Navigation Links
- **From Funnel (Port 3000)** → **VitaBlog (Port 5001)**
  - Click "Visit VitaBlog" in the navigation
  - Opens in new tab: `http://localhost:5001`

- **From VitaBlog (Port 5001)** → **Funnel (Port 3000)**
  - Click "Back to VitaWell.Co" in the navigation
  - Opens in new tab: `http://localhost:3000`

### Authentication Integration

The VitaBlog is integrated with the VitaWell funnel's application system:

1. **User Flow:**
   - User submits application on VitaWell funnel → saved to `applications.json`
   - User can login to VitaBlog using the same email
   - If email is in `applications.json`, they get "author" role automatically
   - If email has `status: "approved"`, they get immediate access

2. **File Sharing:**
   - VitaBlog reads `applications.json` from the root directory
   - Both systems share the same user data
   - No duplicate data storage needed

### Running Both Systems

**Terminal 1 - Funnel Server:**
```bash
npm start
# Runs on http://localhost:3000
```

**Terminal 2 - VitaBlog Server:**
```bash
cd VitaBlog
npm run server:dev
# Runs on http://localhost:5001
```

### Integration Features

✅ **Shared User Data** - Applications from funnel can access blog  
✅ **Seamless Navigation** - Links between both platforms  
✅ **Unified Branding** - Consistent VitaWell.Co branding  
✅ **Cross-Platform Auth** - Email-based login works across both  

### API Endpoints

**Funnel (Port 3000):**
- `POST /api/appointments` - Submit appointment
- `POST /api/apply` - Submit application
- `GET /api/admin/applications` - Admin view applications

**VitaBlog (Port 5001):**
- `POST /api/auth/email-auth` - Login with email from applications.json
- `POST /api/auth/register` - Register new user
- `GET /api/posts` - Get blog posts
- `POST /api/subscribers` - Subscribe to blog

### Data Flow

```
VitaWell Funnel (Port 3000)
    ↓
applications.json
    ↓
VitaBlog (Port 5001)
    ↓
User Authentication & Access
```

### Production Setup

For production, update the links in:
- `index.html` (line 99) - Change `http://localhost:5001` to your production blog URL
- `VitaBlog/client/index.html` (line 113) - Change `http://localhost:3000` to your production funnel URL

Or use environment variables:
```javascript
const BLOG_URL = process.env.BLOG_URL || 'http://localhost:5001';
const FUNNEL_URL = process.env.FUNNEL_URL || 'http://localhost:3000';
```

## 🎯 Benefits

1. **Unified Experience** - Users can move seamlessly between funnel and blog
2. **Shared Authentication** - One application grants access to both
3. **Content Marketing** - Blog drives traffic back to funnel
4. **Lead Generation** - Blog subscribers can become funnel applicants
5. **Brand Consistency** - Single brand experience across platforms

