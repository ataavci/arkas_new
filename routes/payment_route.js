const express = require('express');
const router = express.Router();
const payment_controller = require('../controller/payment_controller');


router.post("/api/payment_tr",payment_controller.localPayment);
router.post("/api/payment_fr",payment_controller.foreignPayment);




router.get('/payment', (req, res) => {
    res.render("payment/payment", { layout: false });
});


module.exports = router;