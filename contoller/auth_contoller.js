const{validationResult}=require("express-validator");

const login_page_show= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const login= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const register_page_show = (req, res) => {
    
    res.render("register", { 
        layout: "layout/auth_layout.ejs",
        validationErrors: req.flash("validation_error") || []
    });
};

const register = (req, res) => {
    const wrongs = validationResult(req);

    if (!wrongs.isEmpty()) {
        req.flash("validation_error", wrongs.array());
        req.flash("name",req.body.name);
        req.flash("surname",req.body.surname);
        req.flash("email",req.body.email);
        req.flash("password",req.body.password);
        req.flash("repassword",req.body.repassword);
        req.flash("repassword",req.body.repassword);
        req.flash("phone",req.body.phone);
        
        console.log("Doğrulama hataları:", wrongs.array()); // Hataları konsola yazdır
        return res.redirect("/register"); // Yeniden yönlendirme
    }

    try {
        console.log("Form verileri:", req.body); // Formdan gelen verileri yazdır
        // Kaydetme işlemleri burada
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).send("Bir hata oluştu!");
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