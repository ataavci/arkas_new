var express = require('express');
var router = express.Router();
const admin_controller=require("../controller/office_controller");
const simulation_contoller=require("../controller/carbon_simulation_contoller");
const office=require("../controller/office_controller");
const authMiddleware=require("../middleware/auth_middleware");




router.get("/office/office_dashboard",authMiddleware.openup,admin_controller.dashboard_page_show);
router.get("/office/office_input",authMiddleware.openup,admin_controller.input_page_show)
router.get('/simulation_summary', simulation_contoller.calculateRouteSummary);
router.post('/simulation', simulation_contoller.simulate);
router.get('/countries',authMiddleware.openup,office.getCountries)
router.post('/input',authMiddleware.openup, office.office_calculate);
router.get('/office/scope-emissions',authMiddleware.openup,office.getScopePieCharts);
router.get('/office/monthly-emissions',authMiddleware.openup,office.getMonthlyEmissions);
router.get('/office/mobile-consumption',authMiddleware.openup, office.getMobileConsumptionData);
router.get('/office/monthly-scopes',authMiddleware.openup, office.getMonthlyScopesData);
router.get('/office/scope-data', authMiddleware.openup,office.getScopeData);
router.get('/office/total-emission',authMiddleware.openup, office.getTotalEmission);
router.get('/office/offset-carbon',authMiddleware.openup, office.getTotaloffset);
router.get('/office/offset-percentage',authMiddleware.openup, office.getOffsetPercentage);
router.get('/office/remaining-carbon', authMiddleware.openup,office.getRemainingCarbon);
router.get('/office/remaining-carbon', authMiddleware.openup,office.getRemainingCarbon);




  


module.exports = router;