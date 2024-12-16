const openup = function(req, res, next) {
    if (req.isAuthenticated()) {
        // Kullanıcının service_name değerini kontrol edin
        if (req.user && req.user.service_name === "office") {
            return next();
        } else {
            req.flash("error", ["Unauthorized access: You do not have permission for this service. Please contact info@voosust.com."]);
            return res.redirect("/#contact"); // Yetkisiz erişim için yönlendirme
        }
    } else {
        req.flash("error", ["Please log in"]);
        res.redirect("/login");
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


module.exports={openup,openclose}