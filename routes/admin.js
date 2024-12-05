var express = require('express');
var router = express.Router();
const admin_controller=require("../contoller/admin_controller");
const simulation_contoller=require("../contoller/simulation_contoller");
const office=require("../contoller/office");




router.get("/admin/dashboard",admin_controller.dashboard_page_show);
router.get("/admin/input",admin_controller.input_page_show)
router.post('/simulation', simulation_contoller.simulate);
router.get('/countries',office.getCountries)
router.post('/input', office.office_calculate);

module.exports = router;