const express = require('express');
const router = express.Router();
const { payment } = require('../controller/payment_controller');


router.post("/api/payment",payment)
router.get('/payment', (req, res) => {
    res.render("payment/payment", { layout: false });
});


module.exports = router;