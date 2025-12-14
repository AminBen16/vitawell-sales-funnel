# 🚀 How to Access VitaBlog

## ⚠️ Important: Don't Open HTML File Directly!

**DO NOT** double-click `VitaBlog/client/index.html` to open it in your browser. This will open it using the `file://` protocol, which won't work with the API.

## ✅ Correct Way to Access:

### Step 1: Start the Server
```bash
cd VitaBlog
npm run server:dev
```

You should see:
```
🚀 VitaBlog API running on http://localhost:5001
```

### Step 2: Open in Browser
Open your browser and go to:
```
http://localhost:5001
```

**NOT** `file:///C:/Users/.../index.html`

## 🔍 How to Tell if You're Doing It Wrong:

If you see errors like:
- `file:///api/posts`
- `Access to fetch at 'file:///C:/api/...' has been blocked by CORS policy`
- `Failed to fetch`

Then you're opening the file directly instead of through the server.

## ✅ Correct URLs:

- **Blog Home:** http://localhost:5001
- **API Endpoint:** http://localhost:5001/api/posts
- **Health Check:** http://localhost:5001/api/health

## 🎯 Quick Test:

1. Start server: `cd VitaBlog && npm run server:dev`
2. Open browser: Go to `http://localhost:5001`
3. Click "Blog" in navigation
4. Should see posts loading (or "No blog posts yet" message)

---

**Remember:** Always access through `http://localhost:5001`, never open the HTML file directly!

