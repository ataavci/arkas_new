const{validationResult}=require("express-validator");
const USER =require("../modals/user");

const passport = require("../db/passport_local");
const { connect } = require("../routes");

const bcrypt=require("bcryptjs");
const nodemailer=require("nodemailer");
const jwt =require("jsonwebtoken");


const login_page_show= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: "/admin/dashboard",
        failureRedirect: "/login",
        failureFlash: true, // Flash mesajlarını etkinleştirir
    })(req, res, next);
};

const register_page_show = (req, res) => {
    
    res.render("register", { 
        layout: "layout/auth_layout.ejs",
        validationErrors: req.flash("validation_error") || []
    });
};

const register = async (req, res, next) => {
    const wrongs = validationResult(req);

    // Doğrulama hatalarını kontrol et
    if (!wrongs.isEmpty()) {
        req.flash("validation_error", wrongs.array());
        req.flash("name", req.body.name);
        req.flash("surname", req.body.surname);
        req.flash("email", req.body.email);
        req.flash("password", req.body.password);
        req.flash("repassword", req.body.repassword);
        req.flash("phone", req.body.phone);

        console.log("Doğrulama hataları:", wrongs.array());
        return res.redirect("/register");
    }

    try {
        // Şifre alanının dolu olup olmadığını kontrol et
        if (!req.body.password) {
            req.flash("validation_error", [{ msg: "Password is required" }]);
            return res.redirect("/register");
        }

        // Kullanıcıyı email'e göre kontrol et
        const existingUser = await USER.findOne({ where: { email: req.body.email } });

        if (existingUser) {
            if (existingUser.emailactive === true) {
                req.flash("validation_error", [{ msg: "This email is already in use" }]);
            } else if (existingUser.emailactive === false) {
                req.flash("validation_error", [
                    { msg: "This email is already registered but not activated. Please check your email." },
                ]);
            }

            req.flash("name", req.body.name);
            req.flash("surname", req.body.surname);
            req.flash("email", req.body.email);
            req.flash("password", req.body.password);
            req.flash("repassword", req.body.repassword);
            req.flash("phone", req.body.phone);
            return res.redirect("/register");
        }

        // Şifreyi hashleme (10 tuzlama)
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Yeni kullanıcıyı oluştur
        const newUser = await USER.create({
            name: req.body.name,
            surname: req.body.surname,
            phone: req.body.phone,
            email: req.body.email,
            password: hashedPassword, // Şifreyi hashlenmiş olarak kaydet
        });

        req.flash("success_message", "Check your mailbox and confirm the e-mail.");
        return res.redirect("/login");

    } catch (error) {
        console.error("Error during registration:", error);
        req.flash("error_message", "An unexpected error occurred. Please try again.");
        return res.redirect("/register");
    }
};
const forget_password_page_show= (req,res)=>{
    res.render("forget-password",{layout:"layout/auth_layout.ejs"})
}
const forget_password= (req,res)=>{
    res.render("forget-password",{layout:"layout/auth_layout.ejs"})
}

const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.error("Logout sırasında hata:", err);
            return next(err);
        }
        req.session.destroy((error) => {
            if (error) {
                console.error("Session yok edilemedi:", error);
                return next(error);
            }
            res.clearCookie("connect.sid", { path: '/' });
            res.redirect("/login");
        });
    });
};

module.exports = { logout };





module.exports={
    login_page_show,
    register_page_show,
    forget_password_page_show,
    register,
    login,
    forget_password,
    logout
}