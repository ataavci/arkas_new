var express = require('express');
var router = express.Router();
const admin_controller=require("../contoller/office_controller");
const simulation_contoller=require("../contoller/carbon_simulation_contoller");
const office=require("../contoller/office_controller");
const authMiddleware=require("../middleware/auth_middileware");




router.get("/office/office_dashboard",authMiddleware.openup,admin_controller.dashboard_page_show);
router.get("/office/office_input",admin_controller.input_page_show)
router.post('/simulation', simulation_contoller.simulate);
router.get('/countries',office.getCountries)
router.post('/input', office.office_calculate);
router.get('/office/scope-emissions',office.getScopePieCharts);


module.exports = router;