
var officeRouter = require('./routes/office_route');
var authRouter = require('./routes/auth');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const sequelize = require("./db/db");
const simulation_contoller = require("./contoller/carbon_simulation_contoller"); 
require("dotenv").config();

const expressLayouts = require("express-ejs-layouts");
const session = require("express-session"); // session tanımını buraya taşıdık
const flash = require("connect-flash");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");






var app = express();

const MySQLStore = require('express-mysql-session')(session); // Bu artık session'dan sonra

const options = {
	host: process.env.DB_HOST || 'localhost',
	port: process.env.DB_PORT || 3306, // Varsayılan MySQL portu
	user: process.env.DB_USER ,
	password: process.env.DB_PASSWORD ,
	database: process.env.DB_NAME
};
const sessionStore = new MySQLStore(options);

app.use(session({
	secret: process.env.session_secret , // Güvenlik için çevresel değişken kullanın
	store: sessionStore,
	resave: true, // Oturum her istekte yeniden kaydedilmez
	saveUninitialized: false, // Boş oturumları kaydetmez
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // 2 saat (ms cinsinden)
        httpOnly: true, // XSS saldırılarını önler
        secure: process.env.NODE_ENV === 'production' // HTTPS üzerinde çalışırsa true olmalı
    }
}));
app.use(passport.initialize());
app.use(passport.session());


// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});
// View engine setup
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





app.use(flash());
app.use((req,res,next)=>{
    res.locals.validation_error=req.flash("validation_error");
    res.locals.success_message=req.flash("success_message");
    res.locals.error = req.flash("error"); // Flash hata mesajı
    res.locals.name=req.flash("name");
    res.locals.surname=req.flash("surname");
    res.locals.email=req.flash("email");
    res.locals.phone=req.flash("phone");
    res.locals.password=req.flash("password");
    res.locals.repassword=req.flash("repassword");
    
    res.locals.user = req.user 
    console.log("User in session:", req.user);

    res.locals.login_error=req.flash("error")
    next();

});


app.use(passport.initialize());
app.use(passport.session());
app.use(expressLayouts);





app.use( officeRouter);
app.use( authRouter);


app.use(passport.initialize());
app.use(passport.session());

app.use(helmet()); 
app.use(cors()); 
app.use(helmet.xssFilter());
app.use(helmet.noSniff());






// Sequelize bağlantısını doğrula
sequelize
  .authenticate()
  .then(() => {
    console.log("Veritabanı bağlantısı doğrulandı ve başarılı!");
  })
  .catch((error) => {
    console.error("Veritabanı bağlantısında hata oluştu:", error.message);
  });

  
app.get('/generate-pdf', async (req, res) => {
  try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // HTML içeriğini tabloyla birlikte oluşturun
      const htmlContent = `
      <html>
          <head>
              <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  header { font-size: 20px; text-align: center; margin-bottom: 20px; font-weight: bold; }
                  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                  table, th, td { border: 1px solid black; }
                  th, td { padding: 8px; text-align: center; }
                  .total { font-weight: bold; }
                  .category { background-color: #f2f2f2; font-weight: bold; }
              </style>
          </head>
          <body>
              <header>
                  Environmental Data Report - 2024
              </header>
              <div class="container">
                  <table>
                      <thead>
                          <tr>
                              <th>Scope</th>
                              <th>Activity Type</th>
                              <th>Jan</th>
                              <th>Feb</th>
                              <th>Mar</th>
                              <th>Apr</th>
                              <th>May</th>
                              <th>Jun</th>
                              <th>Jul</th>
                              <th>Aug</th>
                              <th>Sep</th>
                              <th>Oct</th>
                              <th>Nov</th>
                              <th>Dec</th>
                              <th>Other</th>
                              <th>Total</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr class="category">
                              <td>Scope 1</td>
                              <td>Stationary Combustion</td>
                              <td colspan="14"></td>
                          </tr>
                          <tr>
                              <td></td>
                              <td>Mobile Combustion</td>
                              <td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td>
                          </tr>
                          <tr>
                              <td colspan="15" class="total">Scope 1 Total</td>
                              <td>0.00</td>
                          </tr>
                          <tr class="category">
                              <td>Scope 2</td>
                              <td>Purchased Electricity - Location Based</td>
                              <td>0.24</td><td colspan="13"></td><td>0.24</td>
                          </tr>
                          <tr>
                              <td colspan="15" class="total">Scope 2 Total</td>
                              <td>0.24</td>
                          </tr>
                          <tr class="category">
                              <td>Scope 3</td>
                              <td>Purchased Goods and Services</td>
                              <td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td>
                          </tr>
                          <tr>
                              <td></td>
                              <td>Business Travel</td>
                              <td>1.92</td><td>1.92</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>#N/A</td><td>1.92</td>
                          </tr>
                          <tr>
                              <td colspan="15" class="total">Scope 3 Total</td>
                              <td>2.00</td>
                          </tr>
                          <tr class="total">
                              <td colspan="15">Overall Total</td>
                              <td>#N/A</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </body>
      </html>
      `;

      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({ format: 'A4' });

      await browser.close();

      // PDF dosyasını indirme
      res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="Environmental_Report_2024.pdf"',
      });
      res.send(pdfBuffer);
  } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      res.status(500).send('PDF oluşturulurken bir hata oluştu.');
  }
});

// Portu dinleme
const PORT = process.env.PORT || 3000; // Çevresel değişken yoksa 3000'i kullan
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
