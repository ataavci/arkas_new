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
router.get('/office/monthly-emissions',office.getMonthlyEmissions);
router.get('/office/mobile-consumption', office.getMobileConsumptionData);
router.get('/office/monthly-scopes', office.getMonthlyScopesData);
router.get('/office/scope-data', office.getScopeData);
router.get('/office/total-emission', office.getTotalEmission);
router.get('/office/offset-carbon', office.getTotaloffset);
router.get('/office/offset-percentage', office.getOffsetPercentage);
router.get('/office/remaining-carbon', office.getRemainingCarbon);


module.exports = router;