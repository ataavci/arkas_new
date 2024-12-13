const LocalStradegy = require("passport-local").Strategy;
const passport = require("passport");
const USER = require("../modals/user");

passport.use(
    new LocalStradegy(
        { usernameField: "email", passwordField: "password" },
        async (email, password, done) => {
            try {
                const user = await USER.findOne({ where: { email } });
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                // Şifre doğrulama
                if (user.password !== password) {
                    return done(null, false, { message: "Wrong password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await USER.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, user);
    }
});

module.exports = passport;
