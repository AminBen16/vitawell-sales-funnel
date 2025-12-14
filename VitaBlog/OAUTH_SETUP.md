# OAuth Setup Guide for VitaBlog

## 🔐 OAuth Authentication Implemented

VitaBlog now supports OAuth login with **Google** and **GitHub**!

## 📦 Installation

First, install the required packages:

```bash
cd VitaBlog
npm install
```

This will install:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-github2` - GitHub OAuth strategy
- `express-session` - Session management

## 🔧 Configuration

### 1. Update your `.env` file

Add these OAuth credentials to your `.env` file:

```env
# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5001/api/auth/github/callback

# Session Secret (change this in production!)
SESSION_SECRET=your-random-secret-key-here

# Client URL (for OAuth redirects)
CLIENT_URL=http://localhost:5001
```

### 2. Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URI: `http://localhost:5001/api/auth/google/callback`
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### 3. Set up GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: VitaBlog
   - **Homepage URL**: `http://localhost:5001`
   - **Authorization callback URL**: `http://localhost:5001/api/auth/github/callback`
4. Click **Register application**
5. Copy the **Client ID** and generate a **Client Secret**
6. Add both to your `.env` file

## 🚀 Usage

### For Users

1. Click **"Sign In"** in the navigation
2. Choose **"Continue with Google"** or **"Continue with GitHub"**
3. Authorize the application
4. You'll be automatically logged in!

### Features

- ✅ **Automatic Account Creation** - New users are created automatically
- ✅ **Profile Image Sync** - Profile pictures from OAuth providers
- ✅ **Email Linking** - Existing accounts are linked by email
- ✅ **No Password Required** - OAuth users don't need passwords
- ✅ **Seamless Integration** - Works with existing authentication

## 🔄 Database Migration

The User model has been updated to support OAuth:
- `password` field is now nullable (for OAuth users)
- Added `oauthProvider` field (google, github, etc.)
- Added `oauthId` field (provider's user ID)

The database will auto-migrate when you restart the server.

## 🧪 Testing

1. Start the server:
   ```bash
   npm run server:dev
   ```

2. Open http://localhost:5001

3. Click **"Sign In"**

4. Try logging in with Google or GitHub

5. You should be redirected back and logged in!

## 🛠️ Troubleshooting

### "OAuth callback failed"
- Check that your callback URLs match exactly in both `.env` and OAuth provider settings
- Ensure the server is running on the correct port

### "Invalid credentials" for OAuth users
- OAuth users don't have passwords, so they can't use email/password login
- They must use OAuth login

### "Session secret" warning
- Change `SESSION_SECRET` in production to a secure random string

## 📝 Production Setup

For production, update:
1. Callback URLs to your production domain
2. `CLIENT_URL` to your production URL
3. `SESSION_SECRET` to a secure random string
4. Enable HTTPS (required for secure cookies)

## 🎯 OAuth Providers Supported

- ✅ **Google** - Full implementation
- ✅ **GitHub** - Full implementation
- 🔄 **Facebook** - Can be added easily
- 🔄 **Twitter** - Can be added easily

## 📚 API Endpoints

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

---

**OAuth is now fully integrated!** 🎉

