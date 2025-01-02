const express = require('express');
const router = express.Router();
const payment_controller = require('../controller/payment_controller');
const authMiddleware=require("../middleware/auth_middleware");



router.post("/api/payment_tr",payment_controller.localPayment);
router.post("/api/payment_fr",payment_controller.foreignPayment);




router.get("/payment", authMiddleware.restrictAccess, payment_controller.getPaymentPage);

// Ödeme işlemi




module.exports = router;