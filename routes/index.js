var express = require('express');
var router = express.Router();
const simulation_contoller=require("../contoller/simulation_contoller");
const office=require("../contoller/office");


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/simulation', simulation_contoller.simulate);
router.post('/officeinput', async (req, res) => {
  try {
    // Office input işlemleri
    const calculationResult = await office.office_calculate(req);

    // Ülkeleri alma işlemi
    const countries = await office.getCountries(req);

    // Tek bir yanıt döndür
    res.status(200).json({
      message: 'Office input işlemi başarıyla tamamlandı.',
      calculationResult,
      countries
    });
  } catch (err) {
    console.error('Office input işlemi sırasında hata:', err);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});
  


module.exports = router;
