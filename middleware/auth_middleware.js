const openup = function (req, res, next) {
    if (req.isAuthenticated()) {
        // Kullanıcının service_name kontrolü
        if (req.user && req.user.service_name === "office") {
            return next(); // Yetkili kullanıcı
        } else {
            req.flash("error", ["Unauthorized access: You do not have permission for this service. Please contact info@voosust.com."]);
            return res.redirect("/#contact"); // Yetkisiz erişim için yönlendirme
        }
    } else {
        req.flash("error", ["Please log in"]); // Giriş yapmamış kullanıcılar için mesaj
        return res.redirect("/login");
    }
};





const openclose = function(req,res,next){
    if(!req.isAuthenticated()){
        return next()

    }else{
        req.flash("error",["Please log in"])
        res.redirect("/office/office_dashboard");
    }
}
const restrictAccess = (req, res, next) => {
    if (req.isAuthenticated()) {
        // Kullanıcı giriş yapmışsa devam et
        return next();
    }
    // Kullanıcı giriş yapmamışsa register sayfasına yönlendir
    req.session.redirectTo = "/payment"; // Hedef rota kaydedilir
    req.flash("error", ["You must register or log in to access this page."]);
    return res.redirect("/register");
};




module.exports={openup,openclose,restrictAccess}