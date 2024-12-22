const{validationResult}=require("express-validator");
const USER =require("../models/user");
const axios = require("axios");

const passport = require("../db/passport_local");


const bcrypt=require("bcryptjs");
const nodemailer=require("nodemailer");
const jwt =require("jsonwebtoken");


const login_page_show= (req,res)=>{
    res.render("login",{layout:"layout/auth_layout.ejs"})
}
const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); // Hata varsa bir sonraki middleware'e ilet
        }
        if (!user) {
            req.flash("error", ["Invalid credentials"]);
            return res.redirect('/login'); // Kullanıcı bulunamazsa login sayfasına yönlendir
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            // Kullanıcı rolüne göre yönlendirme yap
            if (user.service_name === 'office') {
                return res.redirect('/office/office_dashboard'); // Office sistemine yönlendir
            } else if (user.service_name === 'admin') {
                return res.redirect('/admin/dashboard'); // Admin sistemine yönlendir
            }

            // Varsayılan yönlendirme
            req.flash("info", ["Logged in successfully"]);
            return res.redirect('/');
        });
    })(req, res, next);
};

const register_page_show = (req, res) => {
    
    res.render("register", { 
        layout: "layout/auth_layout.ejs",
        validationErrors: req.flash("validation_error") || []
    });
};

const register = async (req, res, next) => {
    const wrongs = validationResult(req);

    // Doğrulama hatalarını kontrol et
    if (!wrongs.isEmpty()) {
        req.flash("validation_error", wrongs.array());
        req.flash("name", req.body.name);
        req.flash("surname", req.body.surname);
        req.flash("email", req.body.email);
        req.flash("password", req.body.password);
        req.flash("repassword", req.body.repassword);
        req.flash("phone", req.body.phone);

        console.log("Doğrulama hataları:", wrongs.array());
        return res.redirect("/register");
    }
    // Honeypot Kontrolü
if (req.body.honeypot) {
    console.log("Bot algılandı. Honeypot alanı doldurulmuş.");
    req.flash("error_message", "Geçersiz bir gönderim tespit edildi.");
    return res.redirect("/register");
}


    try {
        // Şifre alanının dolu olup olmadığını kontrol et
        if (!req.body.password) {
            req.flash("validation_error", [{ msg: "Password is required" }]);
            return res.redirect("/register");
        }

        // Kullanıcıyı email'e göre kontrol et
        const existingUser = await USER.findOne({ where: { email: req.body.email } });

        if (existingUser) {
            if (existingUser.emailactive === true) {
                req.flash("validation_error", [{ msg: "This email is already in use" }]);
            } else if (existingUser.emailactive === false) {
                req.flash("validation_error", [
                    { msg: "This email is already registered but not activated. Please check your email." },
                ]);
            }

            req.flash("name", req.body.name);
            req.flash("surname", req.body.surname);
            req.flash("email", req.body.email);
            req.flash("password", req.body.password);
            req.flash("repassword", req.body.repassword);
            req.flash("phone", req.body.phone);
            return res.redirect("/register");
        }

        // Şifreyi hashleme (10 tuzlama)
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Yeni kullanıcıyı oluştur
        const newUser = await USER.create({
            name: req.body.name,
            surname: req.body.surname,
            phone: req.body.phone,
            email: req.body.email,
            password: hashedPassword, // Şifreyi hashlenmiş olarak kaydet
        });

        req.flash("success_message", "Check your mailbox and confirm the e-mail.");
        //jwt işlemleri 

        const jwtinformation = {
            mail: newUser.email,  
        };
        if (!process.env.CONFIRM_MAIL_JWT_SECRET) {
            throw new Error("JWT Secret Key tanımlı değil!");
        }
        
        const jwtToken = jwt.sign(jwtinformation, process.env.CONFIRM_MAIL_JWT_SECRET, { expiresIn: "1d" });
        

        // Mail gönderme işlemleri
        const url = `${process.env.WEB_SIDE_ADDRESS}verify?mail=${jwtToken}`;
        console.log("Gidilecek URL: " + url);

        let transporter = nodemailer.createTransport({
            host: "ns80-out.dnscini.com", 
            port: 587,  
            secure: false,  
            auth: {
                user: process.env.mail_name,  
                pass: process.env. mail_password 
            },
            tls: {
                rejectUnauthorized: false  // Sertifika sorunlarını önlemek için
            }
        });

        const info = await transporter.sendMail({
            from: "VooSust Digital Solutions <ataavci@voosust.com>",  
            to: newUser.email,  
            subject: "Welcome to Voosust - Confirm Your Email",
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Voosust Email Confirmation</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .logo {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .logo img {
                            max-width: 150px; /* Logonun genişliği */
                            height: auto;
                        }
                        h2 {
                            text-align: center;
                            color: #333;
                        }
                        .content {
                            color: #333;
                            font-size: 16px;
                            line-height: 1.5;
                            margin-bottom: 20px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #4CAF50;
                            color: white;
                            padding: 10px 20px;
                            text-decoration: none;
                            font-size: 16px;
                            border-radius: 5px;
                            text-align: center;
                        }
                        .footer {
                            text-align: center;
                            color: #999;
                            font-size: 14px;
                        }
                        .footer a {
                            color: #4CAF50;
                            text-decoration: none;
                        }
                        .footer hr {
                            border: none;
                            border-top: 1px solid #ddd;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div style="background-color: #f7f7f7; padding: 20px;">
                        <div class="container">
        
                            <!-- Logo alanı -->
                            <div class="logo">
                                <img src="./public/image/VooSust .png" alt="Voosust Logo">
                            </div>
        
                            <h2>Welcome to Voosust Sustainability Solutions</h2>
                            <div class="content">
                                <p>Dear <strong>${newUser.name} ${newUser.surname}</strong>,</p>
                                <p>Thank you for registering with <strong>Voosust Digital Solutions</strong>. We are thrilled to have you as part of our community and look forward to helping you achieve your sustainability goals. Whether you are just beginning or advancing your sustainability journey, Voosust provides a range of solutions designed to meet your unique needs.</p>
                                <p>To complete your registration and activate your account, please verify your email by clicking the button below:</p>
                                
                                <p style="text-align: center;">
                                    <a href="${url}" class="btn">Verify Your Email</a>
                                </p>
                                
                                <p>If the button above does not work, please click the following link or copy and paste it into your browser:</p>
                                <p style="text-align: center; word-wrap: break-word;">
                                    <a href="${url}" style="color: #4CAF50;">${url}</a>
                                </p>
        
                                <p>We are excited to have you on board and look forward to helping you achieve your sustainability objectives. If you have any questions, please feel free to reach out to our support team.</p>
                                <p>Sincerely,</p>
                                <p><strong>The Voosust Digital Solutions Team</strong></p>
                            </div>
        
                            <hr>
        
                            <div class="footer">
                                <p>Voosust Digital Solutions<br>+90 533 357 27 47 | info@voosust.com<br>207/Z Doğuş Street, DEU Tınaztepe Campus, Buca, 35390 Izmir, Turkey</p>
                                <p><a href="https://www.voosust.com">www.voosust.com</a></p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        

        // Kayıt başarılı, kullanıcıyı login sayfasına yönlendir ve mesaj göster
        req.flash("success_message", "Registration successful! Please check your mailbox.");
        return res.redirect("/login");

    } catch (err) {
        console.error("Kayıt yapılırken bir hata oluştu:", err);
        req.flash("error_message", "An error occurred, please try again.");
        return res.redirect("/register");
    }
};


const forget_password_page_show= (req,res)=>{
    res.render("forget-password",{layout:"layout/auth_layout.ejs"})
}
const forget_password = async (req, res) => {
    const errors = validationResult(req);

    // Doğrulama hatalarını kontrol et
    if (!errors.isEmpty()) {
        req.flash("validation_error", errors.array());
        return res.redirect("/forget-password");
    }

    try {
        // Kullanıcı email adresini kontrol et
        const existingUser = await USER.findOne({ where: { email: req.body.email } });

        if (!existingUser) {
            req.flash("validation_error", [{ msg: "No user found with this email address" }]);
            return res.redirect("/forget-password");
        }

        // Şifre sıfırlama için JWT oluştur
        const jwtToken = jwt.sign(
            { email: existingUser.email, id: existingUser.id },
            process.env.RESET_PASSWORD_JWT_SECRET,
            { expiresIn: "1h" } // Token geçerlilik süresi
        );

        // Şifre sıfırlama URL'si
        const resetUrl = `${process.env.WEB_SIDE_ADDRESS}reset-password?token=${jwtToken}`;

        // Nodemailer ile email gönderimi
        const transporter = nodemailer.createTransport({
            host: "127.0.0.1",
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_NAME,
                pass: process.env.MAIL_PASSWORD,
            },
            tls: { rejectUnauthorized: false },
        });

        // E-posta gönder
        await transporter.sendMail({
            from: `Voosust Digital Solutions <${process.env.MAIL_NAME}>`,
            to: existingUser.email,
            subject: "Reset Your Password",
            html: `
                <h2>Reset Your Password</h2>
                <p>Hi ${existingUser.name},</p>
                <p>We received a request to reset your password. Click the link below to reset it:</p>
                <a href="${resetUrl}" style="padding: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
            `,
        });

        req.flash("success_message", "Password reset email sent successfully. Please check your inbox.");
        return res.redirect("/forget-password");

    } catch (err) {
        console.error("Error during password reset process:", err);
        req.flash("error_message", "An error occurred. Please try again later.");
        return res.redirect("/forget-password");
    }
};


const logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.error("Logout sırasında hata:", err);
            return next(err);
        }
        req.session.destroy((error) => {
            if (error) {
                console.error("Session yok edilemedi:", error);
                return next(error);
            }
            res.clearCookie("connect.sid", { path: '/' });
            res.redirect("/login");
        });
    });
};

const verifyMail = async (req, res, next) => {
    const token = req.query.id;  // `mail` query parametresini kontrol ediyoruz

    if (token) {
        try {
            // JWT'yi verify ile kontrol ediyoruz
            const decoded = jwt.verify(token, process.env.CONFIRM_MAIL_JWT_SECRET);

            // Token'den gelen mail bilgisini alıyoruz
            const tokeninemail = decoded.mail;

            // Kullanıcıyı buluyoruz ve emailactive'yi güncelliyoruz
            const user = await USER.findOne({ where: { email: tokeninemail } });

            if (user) {
                // Kullanıcının emailactive durumunu true yapıyoruz (email doğrulandı)
                user.emailactive = true;
                await user.save();

                // Başarı mesajı göster
                req.flash("success_message", "Mail başarıyla onaylandı.");
                return res.redirect('/login');
            } else {
                // Kullanıcı bulunamazsa hata mesajı
                req.flash("error_message", "Kullanıcı bulunamadı, lütfen tekrar kayıt olun.");
                return res.redirect('/register');
            }
        } catch (error) {
            console.log("Token doğrulanamadı:", error.message);
            req.flash("error_message", "Token geçersiz veya süresi dolmuş.");
            return res.redirect('/login');
        }
    } else {
        console.log("Token yok");
        req.flash("error_message", "Token bulunamadı.");
        return res.redirect('/login');
    }
};





module.exports={
    login_page_show,
    register_page_show,
    forget_password_page_show,
    register,
    login,
    forget_password,
    logout,
    verifyMail
}