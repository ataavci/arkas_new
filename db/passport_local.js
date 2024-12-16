const LocalStradegy = require("passport-local").Strategy;
const passport = require("passport");
const USER = require("../models/user");
const bcrypt = require('bcryptjs');



passport.use(
    new LocalStradegy(
        { usernameField: 'email', passwordField: 'password' },
        async (email, password, done) => {
            try {
                const user = await USER.findOne({ where: { email } });

                if (!user) {
                    return done(null, false, { message: 'No user with this email.' });
                }

                // Şifreyi doğrula
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: 'Password incorrect.' });
                }

                if (!user.emailactive) {
                    return done(null, false, { message: 'Please verify your email first.' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    console.log("Serialize User ID:", user.id); // Serialize edilen ID'yi kontrol edin
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userId = id.id || id; // Gelen ID'nin obje ya da düz bir değer olup olmadığını kontrol edin
        const user = await USER.findByPk(userId);
        if (!user) {
            console.error("User not found for ID:", userId);
            return done(null, false);
        }
        done(null, user);
    } catch (err) {
        console.error("Error in deserializeUser:", err);
        done(err, null);
    }
});


module.exports = passport;
