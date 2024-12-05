var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sequelize = require("./db/db");
const simulation_contoller=require("../arkas_new/contoller/simulation_contoller"); 
require("dotenv").config();// Sequelize bağlantısı

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter= require("./routes/auth");
const expressLayouts=require("express-ejs-layouts");
const session =require("express-session");
const flash=require("connect-flash");

var app = express();

// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);
app.use(usersRouter);
app.use(authRouter);




app.use(expressLayouts);
app.use(session({
    secret:process.env.session_secret,
    resave: false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*5
    }
}
))
app.use(flash());
// Rota kullanımı

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
