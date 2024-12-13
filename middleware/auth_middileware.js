const openup = function(req,res,next){
    if(req.isAuthenticated()){
        return next()

    }else{
        req.flash("error",["Please log in"])
        res.redirect("/login");
    }
}

const openclose = function(req,res,next){
    if(!req.isAuthenticated()){
        return next()

    }else{
        req.flash("error",["Please log in"])
        res.redirect("/admin/dashboard");
    }
}


module.exports={openup,openclose}