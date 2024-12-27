const express = require('express');
const router = express.Router();
const { payment } = require('../controller/payment_controller');


router.post("/api/payment",payment)

module.exports = router;