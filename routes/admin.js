var express = require('express');
var router = express.Router();
const admin_controller=require("../contoller/admin_controller");

router.get("/admin/dashboard",admin_controller.dashboard_page_show);
router.get("/admin/input",admin_controller.input_page_show)


module.exports = router;