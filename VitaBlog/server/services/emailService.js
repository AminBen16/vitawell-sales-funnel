const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables or default to console logging for development
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // For development: use console logging (no actual email sent)
    console.log('⚠️  Email service not configured. Using console logging mode.');
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }
};

const transporter = createTransporter();

/**
 * Send verification code email
 */
async function sendVerificationCode(email, code, firstName = 'User') {
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vitablog.co',
    to: email,
    subject: 'Verify Your VitaBlog Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #1e40af; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 5px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to VitaBlog!</h1>
          </div>
          <div class="content">
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up for VitaBlog. Please verify your email address by entering the code below:</p>
            
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>
            
            <p>Best regards,<br>The VitaBlog Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} VitaBlog. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to VitaBlog!
      
      Hi ${firstName},
      
      Thank you for signing up for VitaBlog. Please verify your email address by entering this code:
      
      ${code}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account, please ignore this email.
      
      Best regards,
      The VitaBlog Team
    `
  };

  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } else {
      // Development mode: log to console
      console.log('\n📧 ===== EMAIL (Development Mode) =====');
      console.log('To:', email);
      console.log('Subject:', mailOptions.subject);
      console.log('Verification Code:', code);
      console.log('=====================================\n');
      return { success: true, messageId: 'console-log', devMode: true };
    }
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
}

module.exports = {
  sendVerificationCode,
  transporter
};

