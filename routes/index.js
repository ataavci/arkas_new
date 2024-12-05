var express = require('express');
var router = express.Router();
const simulation_contoller=require("../contoller/simulation_contoller");
const office=require("../contoller/office");


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/simulation', simulation_contoller.simulate);
router.post('/officeinput',office.office_calculate,office.getCountries);
  


module.exports = router;
