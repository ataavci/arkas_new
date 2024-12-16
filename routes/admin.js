// In adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../contoller/admin_controller');

const multer = require('multer');
const path = require('path');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Route definitions
router.post('/upload',  upload.single('file'), adminController.uploadAndProcessExcel);
router.get('/admin/yonetim',  adminController.mainpageshow);
router.get('/admin/dashboard',  adminController.dashboardpage);
router.get("/admin/chart-data", adminController.getChartData);
router.get("/admin/fuel",  adminController.fuelboard);
router.get("/admin/fuel-consumption",  adminController.getFuelConsumptionData);
router.get("/admin/uk-eu",  adminController.ukpageshow);
router.get("/admin/mrv",  adminController.getVesselsByYear); // Render page
router.get("/admin/uk-eu/data", adminController.getCO2ChartData); // Fetch chart data
router.get("/admin/indicator",  adminController.indicatorpageshow,adminController.getVesselVoyagesByDate);
router.post("/admin/get-vessel-voyages",  adminController.getVesselVoyagesByDate);
router.get("/admin/vessel-names", adminController.getVesselNames);
router.get('/admin/showGraph', adminController.showBarGraphPage); //Sayfa oluştur

// JSON veri döndüren API
router.get('/admin/fetchGraphData', adminController.fetchGraphData);
router.get('/admin/fetchTaxAndEuaData', adminController.fetchTaxAndEuaData);
router.get('/admin/taxAndEuaGraph', adminController.renderTaxAndEuaGraphPage); //Sayfa oluştur
module.exports = router
