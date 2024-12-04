var express = require('express');
var router = express.Router();
const simulation_contoller=require("../contoller/simulation_contoller")


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/simulation', simulation_contoller.simulate)
  


module.exports = router;
