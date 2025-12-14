const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const db = require('../database');
const { generateToken } = require('../middleware/auth');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await db.User.findOne({ where: { email: profile.emails[0].value } });
      
      if (!user) {
        // Create new user from Google profile
        user = await db.User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName || profile.displayName.split(' ')[0] || 'User',
          lastName: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || 'Member',
          password: null, // OAuth users don't have passwords
          role: 'viewer', // Default role, can be upgraded
          isActive: true,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          // Store OAuth provider info
          oauthProvider: 'google',
          oauthId: profile.id
        });
      } else {
        // Update existing user with OAuth info if not already set
        if (!user.oauthProvider) {
          await user.update({
            oauthProvider: 'google',
            oauthId: profile.id,
            profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : user.profileImage
          });
        }
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));
} else {
  console.log('ℹ️  Google OAuth not configured (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing)');
}

// GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // GitHub profile email might be in profile.emails array or need to fetch separately
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : 
                  `${profile.username}@users.noreply.github.com`;
    
    // Find or create user
    let user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      // Create new user from GitHub profile
      const nameParts = profile.displayName ? profile.displayName.split(' ') : [profile.username];
      user = await db.User.create({
        email,
        firstName: nameParts[0] || profile.username || 'User',
        lastName: nameParts.slice(1).join(' ') || 'Member',
        password: null, // OAuth users don't have passwords
        role: 'viewer', // Default role, can be upgraded
        isActive: true,
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        // Store OAuth provider info
        oauthProvider: 'github',
        oauthId: profile.id.toString()
      });
    } else {
      // Update existing user with OAuth info if not already set
      if (!user.oauthProvider) {
        await user.update({
          oauthProvider: 'github',
          oauthId: profile.id.toString(),
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : user.profileImage
        });
      }
    }
    
    return done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
  }));
} else {
  console.log('ℹ️  GitHub OAuth not configured (GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing)');
}

module.exports = passport;

