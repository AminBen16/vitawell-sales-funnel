# 🔗 VitaWell Funnel & VitaBlog - Linked Setup

## ✅ Integration Complete!

Your VitaWell funnel and VitaBlog are now fully linked and integrated.

## 🚀 Quick Start

### Option 1: Run Both Servers Together
```bash
npm run dev:all
```

This runs:
- **Funnel** on http://localhost:3000
- **VitaBlog** on http://localhost:5001

### Option 2: Run Separately

**Terminal 1 - Funnel:**
```bash
npm start
# http://localhost:3000
```

**Terminal 2 - VitaBlog:**
```bash
cd VitaBlog
npm run server:dev
# http://localhost:5001
```

## 🔗 Navigation Links

### From Funnel → Blog
- Click **"Visit VitaBlog"** in the navigation bar
- Opens VitaBlog in a new tab

### From Blog → Funnel
- Click **"Back to VitaWell.Co"** in the navigation bar
- Opens the funnel in a new tab

## 🔐 Authentication Integration

### How It Works:
1. User submits application on **VitaWell funnel** → saved to `applications.json`
2. User can login to **VitaBlog** using the same email
3. If email exists in `applications.json`, they automatically get **"author"** role
4. If email has `status: "approved"`, they get immediate access

### Login Options:
- **Email Auth**: Use email from `applications.json` (no password needed)
- **Standard Login**: Register with email/password

## 📁 Shared Files

- `applications.json` - Shared between both systems
- User data flows from funnel → blog automatically

## 🎯 Features

✅ **Seamless Navigation** - Links work between both platforms  
✅ **Shared Authentication** - One application grants access to both  
✅ **Unified Branding** - Consistent VitaWell.Co experience  
✅ **Cross-Platform Access** - Users can move freely between systems  

## 📝 Next Steps

1. **Test the Links:**
   - Go to http://localhost:3000
   - Click "Visit VitaBlog"
   - Should open http://localhost:5001

2. **Test Authentication:**
   - Submit an application on the funnel
   - Go to VitaBlog
   - Use email auth with your email
   - Should get author access automatically

3. **Customize:**
   - Update branding if needed
   - Add more integration points
   - Customize the user flow

## 🔧 Configuration

### Change Ports (if needed):
- **Funnel**: Edit `server.js` → `const port = 3000;`
- **VitaBlog**: Edit `VitaBlog/server/index.js` → `const PORT = 5001;`

### Update Links for Production:
- `index.html` line 99: Change `http://localhost:5001` to your production blog URL
- `VitaBlog/client/index.html` line 113: Change `http://localhost:3000` to your production funnel URL

## 📚 Documentation

- See `INTEGRATION_GUIDE.md` for detailed integration information
- See `VitaBlog/README.md` for blog documentation
- See `VitaBlog/GET_STARTED.md` for blog setup guide

---

**Everything is linked and ready to use!** 🎉

