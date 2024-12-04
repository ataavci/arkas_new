var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sequelize = require("./db/db");
const simulation_contoller=require("../myapp/contoller/simulation_contoller"); // Sequelize bağlantısı

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);
app.use('/users', usersRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Sequelize bağlantısını doğrula
sequelize
  .authenticate()
  .then(() => {
    console.log("Veritabanı bağlantısı doğrulandı ve başarılı!");
  })
  .catch((error) => {
    console.error("Veritabanı bağlantısında hata oluştu:", error.message);
  });

// Portu dinleme
const PORT = process.env.PORT || 3000; // Çevresel değişken yoksa 3000'i kullan
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
