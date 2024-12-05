const route =require("express").Router()
const auth_controller=require("../contoller/auth_contoller");
const validatorMiddleware=require("../middleware/validation");



route.get("/login",auth_controller.login_page_show);
route.post("/login",auth_controller.login);



route.get("/register",auth_controller.register_page_show);
route.post("/register",validatorMiddleware.validateNewUser(),auth_controller.register);



route.get("/forget-password",auth_controller.forget_password_page_show);
route.post("/forget-password",auth_controller.forget_password);


















module.exports= route