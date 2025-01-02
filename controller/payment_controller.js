const { v4: uuidv4 } = require('uuid');
const Iyzipay = require('iyzipay');
require('dotenv').config();
const Payment = require('../models/payment'); // Payment modelini içe aktar
const moment = require('moment'); 
const getPaymentPage = (req, res) => {
    try {
        const userEmail = req.session.email 
        console.log("User Email:", userEmail);
        res.render("payment/payment", { userEmail ,layout: false  });
    } catch (err) {
        console.error("Error rendering payment page:", err);
        res.status(500).send("An error occurred while loading the payment page.");
    }
};


const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI
});

const STATIC_EXCHANGE_RATE = 35.50;

/**
 * Yerli kartlar için ödeme işlevi
 */
const localPayment = async (req, res) => {
    const id = uuidv4();
    const {
        priceUSD,
        cardUserName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
        registerCard,
        billingAddress,
        shippingAddress,
        buyerInfo,
    } = req.body;

    if (!priceUSD || !cardUserName || !cardNumber || !expireMonth || !expireYear || !cvc || !billingAddress || !shippingAddress || !buyerInfo) {
        return res.status(400).json({ error: "Eksik veya geçersiz bilgi gönderildi." });
    }
    
    try {
        const email = buyerInfo.email; // Extract `buyerInfo.email`
        if (!email) {
            return res.status(400).json({ error: "Email bilgisi eksik." });
        }
    
        const price = (priceUSD * STATIC_EXCHANGE_RATE).toFixed(2); // Convert USD to TRY
        const currency = "TRY";
    
        const data = {
            locale: "tr",
            conversationId: id,
            price,
            paidPrice: price,
            currency,
            installment: '1',
            paymentChannel: "WEB",
            paymentGroup: "PRODUCT",
            paymentCard: {
                cardHolderName: cardUserName,
                cardNumber,
                expireMonth,
                expireYear,
                cvc,
                registerCard: registerCard || '0',
            },
            buyer: buyerInfo,
            shippingAddress,
            billingAddress,
            basketItems: [
                {
                    id: 'BI101',
                    name: 'Binocular',
                    category1: 'Collectibles',
                    category2: 'Accessories',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price,
                },
            ],
        };
    
        iyzipay.payment.create(data, async (err, result) => {
            if (err) {
                console.error("Ödeme sırasında hata oluştu:", err);
                return res.status(500).json({ error: "Ödeme işlemi başarısız.", details: err });
            }
    
            try {
                const paymentResult = result.status === 'success' ? 'success' : 'failure';
    
                // Save payment information to the database
                await Payment.create({
                    email,
                    sendData: JSON.stringify(data),
                    resultData: paymentResult,
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                });
    
                // Send response based on the payment result
                if (result.status === 'success') {
                    return res.status(200).json({ status: 'success', message: 'Ödeme başarılı', result });
                } else {
                    return res.status(400).json({ status: 'failure', message: 'Ödeme başarısız', result });
                }
            } catch (error) {
                console.error("Veritabanı kaydederken hata oluştu:", error.message);
                return res.status(500).json({ error: "Veritabanı işlemi sırasında bir hata oluştu.", details: error.message });
            }
        });
    } catch (error) {
        console.error("İşlem sırasında bir hata oluştu:", error.message);
        return res.status(500).json({ error: "İşlem sırasında bir hata oluştu.", details: error.message });
    }}
    
const foreignPayment = async (req, res) => {
    const id = uuidv4();
    const userEmail = req.session?.email || req.body?.buyerInfo?.email; // Oturumdan veya body'den email al
    const {
        priceUSD,
        cardUserName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
        registerCard,
        billingAddress,
        shippingAddress,
        buyerInfo,
    } = req.body;

    // Gerekli alanların kontrolü
    if (!userEmail || !priceUSD || !cardUserName || !cardNumber || !expireMonth || !expireYear || !cvc || !billingAddress || !shippingAddress || !buyerInfo) {
        return res.status(400).json({ error: "Eksik veya geçersiz bilgi gönderildi." });
    }

    try {
        const price = priceUSD;
        const currency = "USD";

        const startDate = moment();
        const endDate = moment().add(30, 'days');

        const data = {
            locale: "en",
            conversationId: id,
            price,
            paidPrice: price,
            currency,
            installment: '1',
            paymentChannel: "WEB",
            paymentGroup: "PRODUCT",
            paymentCard: {
                cardHolderName: cardUserName,
                cardNumber,
                expireMonth,
                expireYear,
                cvc,
                registerCard: registerCard || '0'
            },
            buyer: {
                id: buyerInfo.id || uuidv4(),
                name: buyerInfo.name || "Unknown",
                surname: buyerInfo.surname || "Unknown",
                gsmNumber: buyerInfo.gsmNumber || "+905350000000",
                email: userEmail, // Kullanıcının e-postası
                identityNumber: buyerInfo.identityNumber || "74300864791",
                lastLoginDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                registrationDate: moment().subtract(1, 'years').format("YYYY-MM-DD HH:mm:ss"),
                registrationAddress: buyerInfo.registrationAddress || "Default Address",
                ip: req.ip || '85.34.78.112',
                city: buyerInfo.city || "New York",
                country: buyerInfo.country || "USA",
                zipCode: buyerInfo.zipCode || "10001"
            },
            shippingAddress,
            billingAddress,
            basketItems: [
                {
                    id: 'BI102',
                    name: 'Telescope',
                    category1: 'Collectibles',
                    category2: 'Accessories',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price
                }
            ]
        };

        iyzipay.payment.create(data, async (err, result) => {
            if (err) {
                console.error("Ödeme sırasında bir hata oluştu:", err);
                return res.status(500).json({ error: "Ödeme işlemi başarısız.", details: err });
            }

            const paymentResult = result?.status === "success" ? "success" : "failure";

            // Ödeme bilgilerini tabloya kaydet
            await Payment.create({
                email: userEmail, // Kullanıcının e-postası tabloya ekleniyor
                sendData: JSON.stringify(data),
                resultData: paymentResult,
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
            });

            if (result.status === 'success') {
                return res.status(200).json({ message: "Ödeme başarılı", result });
            } else {
                return res.status(400).json({ message: "Ödeme başarısız", result });
            }
        });
    } catch (error) {
        console.error("Hata oluştu:", error.message);
        return res.status(500).json({ error: "İşlem sırasında bir hata oluştu.", details: error.message });
    }
};

const sendInvoice = async (req, res) => {
    try {
        const invoiceDetails = req.body; // Assuming invoice details come from the request body
        const {
            userEmail,
            userName,
            userSurname,
            invoiceNumber,
            invoiceDate,
            services,
            totalPrice
        } = invoiceDetails;

        // Generate the invoice email content
        const transporter = nodemailer.createTransport({
            host: "ns80-out.dnscini.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.mail_name,
                pass: process.env.mail_password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const info = await transporter.sendMail({
            from: "VooSust Digital Solutions <ataavci@voosust.com>",
            to: userEmail,
            subject: `Invoice #${invoiceNumber} from Voosust`,
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Invoice</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f7f7f7;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .header h1 {
                            color: #007BFF;
                        }
                        .content {
                            font-size: 16px;
                            line-height: 1.6;
                        }
                        .invoice-details {
                            margin-top: 20px;
                        }
                        .invoice-details table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 10px;
                        }
                        .invoice-details th, .invoice-details td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 14px;
                            color: #555;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Invoice</h1>
                            <p>Invoice Number: <strong>${invoiceNumber}</strong></p>
                            <p>Date: <strong>${invoiceDate}</strong></p>
                        </div>
                        <div class="content">
                            <p>Dear ${userName} ${userSurname},</p>
                            <p>Thank you for using Voosust Digital Solutions. Below are the details of your invoice:</p>
                            <div class="invoice-details">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Service</th>
                                            <th>Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${services.map(service => `
                                            <tr>
                                                <td>${service.name}</td>
                                                <td>${service.price}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th>Total</th>
                                            <th>${totalPrice}</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <p>If you have any questions, please contact our support team.</p>
                        </div>
                        <div class="footer">
                            <p>Voosust Digital Solutions</p>
                            <p>info@voosust.com</p>
                            <p>+90 533 357 27 47</p>
                            <p>www.voosust.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });

        res.status(200).json({
            message: "Invoice sent successfully.",
            info
        });

    } catch (err) {
        console.error("Error sending invoice:", err);
        res.status(500).json({
            error: "An error occurred while sending the invoice."
        });
    }
};

module.exports = { localPayment, foreignPayment, getPaymentPage, sendInvoice };
