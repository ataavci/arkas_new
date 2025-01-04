const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment_controller');

// Ödeme sayfası rotası
router.get("/payment", paymentController.getPaymentPage);

// Checkout form oluşturma rotası
router.post("/checkout-form", paymentController.createCheckoutForm);

// Callback rotası
router.post("/callback", paymentController.handlePaymentCallback);

module.exports = router;
