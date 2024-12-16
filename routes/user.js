const express = require("express");
const router = express.Router();


// Admin sayfası
router.get('/admins/admin', (req, res) => {
    res.render("admins/admin", { layout: false });
});

// Ülkeleri getir
router.get('/countries', (req, res) => {
    res.render("users/countries", { layout: false });
});

// Office hesaplama sayfası
router.post('/input', (req, res) => {
    res.render("users/input", { layout: false });
});

// Blog sayfası
router.get('/blog', (req, res) => {
    res.render("users/blog", { layout: false });
});
router.get('/karsilama', (req, res) => {
    res.render("users/karsilama", { layout: false });
});


// Login sayfası
router.get("/login", (req, res) => {
    res.render("login", { layout: false });
});

// Office price sayfası
router.get('/office_price', (req, res) => {
    res.render("users/office_price", { layout: false });
});

// Avrupa sayfası
router.get('/avrupa', (req, res) => {
    res.render("users/avrupa", { layout: false });
});

// Avrupa-tr sayfası
router.get('/avrupa-tr', (req, res) => {
    res.render("users/avrupa-tr", { layout: false });
});

// Turkey rapor sayfası
router.get('/turkey_rapor', (req, res) => {
    res.render("users/turkey_rapor", { layout: false });
});

// Turkey rapor tr sayfası
router.get('/turkey_rapor-tr', (req, res) => {
    res.render("users/turkey_rapor-tr", { layout: false });
});

// Carbon credi sayfası
router.get('/carbon_credi-tr', (req, res) => {
    res.render("users/carbon_credi-tr", { layout: false });
});

router.get('/carbon_credi', (req, res) => {
    res.render("users/carbon_credi", { layout: false });
});

// CDR sayfası
router.get('/cdr', (req, res) => {
    res.render("users/cdr", { layout: false });
});

// CDR tr sayfası
router.get('/cdr-tr', (req, res) => {
    res.render("users/cdr-tr", { layout: false });
});

// Office carbon sayfası
router.get('/office', (req, res) => {
    res.render("users/office_carbon", { layout: false });
});

// Index-tr sayfası
router.get('/tr', (req, res) => {
    res.render("users/index-tr", { layout: false });
});

// Index sayfası
router.get('/', (req, res) => {
    res.render("users/index", { layout: false });
});

// Input sayfası
router.get('/input', (req, res) => {
    res.render("users/input", { layout: false });
});


router.get("/office_price-tr",(req,res)=>{
    res.render("users/office_price-tr",{layout:false})
})

module.exports = router;
