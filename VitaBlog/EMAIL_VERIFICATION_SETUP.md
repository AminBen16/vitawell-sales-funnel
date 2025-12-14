# Email Verification Setup Guide

## ✅ Email Verification Implemented

VitaBlog now requires email verification for all signups and email-based logins!

## 🔧 How It Works

### Registration Flow:
1. User fills registration form
2. System sends 6-digit verification code to email
3. User enters code
4. Account is created and user is automatically logged in

### Email Login Flow:
1. User enters email
2. System sends 6-digit verification code to email
3. User enters code
4. User is automatically logged in

## 📧 Email Configuration

### Option 1: Development Mode (No Email Setup Required)
In development, verification codes are logged to the console instead of being sent via email.

**Check your server console for codes like:**
```
📧 ===== EMAIL (Development Mode) =====
To: user@example.com
Subject: Verify Your VitaBlog Account
Verification Code: 123456
=====================================
```

### Option 2: Production Mode (SMTP Configuration)

Add these to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@vitablog.co
```

#### Gmail Setup:
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

#### Other Email Providers:
- **Outlook/Hotmail**: `smtp-mail.outlook.com`, port 587
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings
- **Custom SMTP**: Use your provider's settings

## 🎯 Features

✅ **6-Digit Codes** - Easy to enter  
✅ **10-Minute Expiry** - Codes expire after 10 minutes  
✅ **Rate Limiting** - Max 5 attempts per code  
✅ **Resend Protection** - Can resend after 2 minutes  
✅ **Auto-Submit** - Submits when 6 digits entered  
✅ **Beautiful Emails** - HTML email templates  

## 📝 API Endpoints

### POST /api/auth/register
- Sends verification code
- Returns: `{ message, email, expiresIn }`

### POST /api/auth/verify-code
- Verifies code and creates/logs in user
- Returns: `{ message, token, user }`

### POST /api/auth/resend-code
- Resends verification code
- Returns: `{ message, email, expiresIn }`

### POST /api/auth/email-auth
- Sends verification code for email login
- Returns: `{ message, email, expiresIn, userExists }`

## 🧪 Testing

1. **Register:**
   - Fill registration form
   - Check console/email for code
   - Enter code
   - Should be logged in automatically

2. **Email Login:**
   - Enter email
   - Check console/email for code
   - Enter code
   - Should be logged in automatically

3. **Resend Code:**
   - Click "Resend Code" if needed
   - New code sent (rate limited)

## 🔒 Security Features

- Codes expire after 10 minutes
- Maximum 5 verification attempts
- Rate limiting on resend (2 minutes)
- Codes are one-time use
- Old codes are automatically cleaned up

## 📊 Database

A new `verification_codes` table stores:
- Email
- 6-digit code
- Expiration time
- Verification status
- Attempt count
- User data (for signup)

## 🛠️ Troubleshooting

### "Verification code has expired"
- Request a new code using "Resend Code"

### "Too many attempts"
- Request a new code

### "Failed to send verification email"
- Check SMTP configuration in `.env`
- In development, check console for codes

### Codes not appearing in console
- Make sure server is running
- Check server logs for errors

---

**Email verification is now fully functional!** 🎉

