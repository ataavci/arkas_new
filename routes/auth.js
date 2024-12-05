const express = require("express");
const route = express.Router();
const auth_controller = require("../contoller/auth_contoller");
const validatorMiddleware = require("../middleware/validation");

// Ana sayfa rotasını /login'e yönlendir
route.get('/', (req, res) => {
    res.redirect('/login');
});

// Login rotaları
route.get("/login", auth_controller.login_page_show);
route.post("/login", auth_controller.login);

// Register rotaları
route.get("/register", auth_controller.register_page_show);
route.post("/register", validatorMiddleware.validateNewUser(), auth_controller.register);

// Şifre sıfırlama rotaları
route.get("/forget-password", auth_controller.forget_password_page_show);
route.post("/forget-password", auth_controller.forget_password);

module.exports = route;
