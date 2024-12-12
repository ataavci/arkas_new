const{validationResult}=require("express-validator");
const USER =require("../modals/user");

const passport = require("../db/passport_local");


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

    if (!wrongs.isEmpty()) {
        req.flash("validation_error", wrongs.array());
        req.flash("name", req.body.name);
        req.flash("surname", req.body.surname);
        req.flash("email", req.body.email);
        req.flash("password", req.body.password);
        req.flash("repassword", req.body.repassword);
        req.flash("phone", req.body.phone);

        console.log("Doğrulama hataları:", wrongs.array()); // Hataları konsola yazdır
        return res.redirect("/register"); // Yeniden yönlendirme
    }

    try {
        // Kullanıcıyı email'e göre kontrol et
        const existingUser = await USER.findOne({ where: { email: req.body.email } });
        if (existingUser) {
            req.flash("validation_error", [{msg:"This email is already in use"}]);
            req.flash("name", req.body.name);
            req.flash("surname", req.body.surname);
            req.flash("email", req.body.email);
            req.flash("password", req.body.password);
            req.flash("repassword", req.body.repassword);
            req.flash("phone", req.body.phone);
            return res.redirect("/register");
        }

        // Yeni kullanıcıyı oluştur
        const newUser = await USER.create({
            name: req.body.name,
            surname: req.body.surname,
            phone: req.body.phone,
            email: req.body.email,
            password: req.body.password // Şifreyi hashlemeyi unutmayın!
        });

        // Kayıt başarılıysa, giriş sayfasına yönlendirme yapabilirsiniz
        req.flash("success_message", "Registration successful. Please log in.");

        res.redirect("/login");

    } catch (error) {
        console.error("Error during registration:", error);
        req.flash("error_message", "An unexpected error occurred. Please try again.");
        res.redirect("/register");
    }
};

const forget_password_page_show= (req,res)=>{
    res.render("forget-password",{layout:"layout/auth_layout.ejs"})
}
const forget_password= (req,res)=>{
    res.render("forget-password",{layout:"layout/auth_layout.ejs"})
}





module.exports={
    login_page_show,
    register_page_show,
    forget_password_page_show,
    register,
    login,
    forget_password
}