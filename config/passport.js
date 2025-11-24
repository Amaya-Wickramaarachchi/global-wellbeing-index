const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user'); 

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            // FIX: Using absolute URL for callback to ensure it's executed correctly 
            // after Google authentication, eliminating environment ambiguity.
            callbackURL: 'http://localhost:3000/auth/google/callback', 
            
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : 'No Email'
            };

            try {
                let user = await User.findOne({ googleId: profile.id });
                
                if (user) {
                    console.log(`[AUTH] User found and authenticated: ${profile.displayName}`);
                    done(null, user); 
                } else {
                    user = await User.create(newUser); 
                    console.log(`[AUTH] New user created and authenticated: ${profile.displayName}`);
                    done(null, user);
                }
            } catch (err) {
                console.error('[AUTH ERROR] Failed during user lookup/creation:', err);
                done(err, null);
            }
        })
    );

    // Session Management: Serialize user ID to the session
    passport.serializeUser((user, done) => {
        done(null, user.id); 
    });

    // Session Management: Deserialize user object from the stored ID
    // FIX: Using async/await Mongoose query instead of deprecated callback style
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            console.error('[AUTH ERROR] Failed during session deserialization:', err);
            done(err, null);
        }
    });
}