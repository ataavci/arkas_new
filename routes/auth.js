const express = require("express");
const route = express.Router();
const auth_controller = require("../contoller/auth_contoller");
const validatorMiddleware = require("../middleware/validation");
const auth_middileware=require("../middleware/auth_middileware");


// Ana sayfa rotasını /login'e yönlendir
route.get('/', (req, res) => {
    res.redirect('/login');
});

// Login rotaları
route.get("/login",auth_middileware.openclose, auth_controller.login_page_show);
route.post("/login",auth_middileware.openclose, auth_controller.login);

// Register rotaları
route.get("/register", auth_middileware.openclose, auth_controller.register_page_show);
route.post("/register",auth_middileware.openclose, validatorMiddleware.validateNewUser(), auth_controller.register);

// Şifre sıfırlama rotaları
route.get("/forget-password",auth_middileware.openclose, auth_controller.forget_password_page_show);
route.post("/forget-password",auth_middileware.openclose,validatorMiddleware.validateEmail(), auth_controller.forget_password);

route.get("/verify",auth_controller.verifyMail);


route.get("/logout",auth_middileware.openup,auth_controller.logout);

module.exports = route;
