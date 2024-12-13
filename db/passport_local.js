const LocalStradegy = require("passport-local").Strategy;
const passport = require("passport");
const USER = require("../modals/user");
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
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await USER.findByPk(id); // Kullanıcıyı veritabanından bul
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});


module.exports = passport;
