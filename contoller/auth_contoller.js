const{validationResult}=require("express-validator");

const login_page_show= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const login= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const register_page_show= (req,res)=>{
    res.render("register",{layout:"layout/auth_layout.ejs"})
}
const register = (req, res) => {
    const wrongs = validationResult(req);
    if (!wrongs.isEmpty()) {
        console.log("Validation Errors:", wrongs.array());
        return res.status(400).render("register", { errors: wrongs.array(), layout: "layout/auth_layout.ejs" });
    }

    try {
        console.log(req.body);
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