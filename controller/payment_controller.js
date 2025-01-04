const { v4: uuidv4 } = require('uuid');
const Iyzipay = require('iyzipay');
require('dotenv').config();
const Payment = require('../models/payment'); // Payment modelini içe aktar

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI
});

const STATIC_EXCHANGE_RATE = 35.50; // Sabit USD -> TL kuru

// Ürün bilgileri
const products = {
    embrace: {
        name: "Embrace Sustainable in Your Office",
        priceUSD: 25.0, // Ürün fiyatı USD cinsinden
        description: "Embrace paketi - Comprehensive Carbon Footprint Assessment"
    },
    lead: {
        name: "Lead Sustainability",
        priceUSD: 60.0, // Ürün fiyatı USD cinsinden
        description: "Lead paketi - Advanced Carbon Footprint Assessment"
    }
};

/**
 * Ödeme sayfasını yükler
 */
const getPaymentPage = (req, res) => {
    try {
        const userEmail = req.session?.email || "guest@example.com"; // Oturumdan alınan email
        res.render("payment/payment", { userEmail, layout: false });
    } catch (err) {
        console.error("Error rendering payment page:", err);
        res.status(500).send("An error occurred while loading the payment page.");
    }
};

/**
 * Checkout Formu Oluşturma
 */
const createCheckoutForm = async (req, res) => {
    const id = uuidv4();
    const { productType } = req.body; // Formdan gelen ürün tipi (embrace veya lead)

    const selectedProduct = products[productType]; // Seçilen ürün bilgileri
    const email = req.session?.email; // Oturumdan e-posta alınıyor

    if (!email) {
        return res.redirect('/register');
    }

    if (!selectedProduct) {
        return res.status(400).json({ error: "Geçersiz ürün seçimi." });
    }

    const priceUSD = selectedProduct.priceUSD;
    const priceTRY = (priceUSD * STATIC_EXCHANGE_RATE).toFixed(2); // USD -> TL çevirisi

    const data = {
        locale: "tr",
        conversationId: id,
        price: priceTRY,
        paidPrice: priceTRY,
        currency: Iyzipay.CURRENCY.TRY,
        basketId: "B67832",
        paymentGroup: "PRODUCT",
        callbackUrl: 'http://localhost:3000/callback',
        buyer: {
            id: uuidv4(),
            name: req.session?.user?.name || "Guest",
            surname: req.session?.user?.surname || "User",
            email: email, // Oturumdan gelen e-posta
            identityNumber: "74300864791",
            registrationAddress: "Default Address",
            city: "İstanbul",
            country: "Türkiye",
            zipCode: "34732"
        },
        shippingAddress: {
            contactName: "Guest User",
            city: "İstanbul",
            country: "Türkiye",
            address: "Teslimat Adresi",
            zipCode: "34732"
        },
        billingAddress: {
            contactName: "Guest User",
            city: "İstanbul",
            country: "Türkiye",
            address: "Fatura Adresi",
            zipCode: "34732"
        },
        basketItems: [
            {
                id: uuidv4(),
                name: selectedProduct.name,
                category1: "Office Services",
                category2: "Subscription",
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: priceTRY
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(data, async (err, result) => {
        if (err) {
            console.error("Ödeme formu oluşturulurken hata:", err);
            return res.status(500).json({ error: "Ödeme formu oluşturulamadı." });
        }

        if (result.status === 'success') {
            // Ödeme formu başarılı bir şekilde oluşturulduğunda, ödeme sayfasını render et
            res.render('payment/payment', { layout: false, checkoutFormContent: result.checkoutFormContent });
        } else {
            console.error("Ödeme formu başarısız:", {
                errorCode: result.errorCode,
                errorMessage: result.errorMessage,
                errorGroup: result.errorGroup
            });
            res.status(400).json({ status: 'failure', message: 'Ödeme formu oluşturulamadı', result });
        }
    });
};

/**
 * Callback işlemi: Ödeme doğrulama
 */
const handlePaymentCallback = (req, res) => {
    const token = req.body.token;
    const email = req.session?.email ; // Oturumdan e-posta alınıyor

    const request = {
        locale: "tr",
        conversationId: uuidv4(),
        token: token,
    };

    iyzipay.checkoutForm.retrieve(request, async (err, result) => {
        if (err) {
            console.error("Callback sırasında hata:", err);
            return res.status(500).json({ error: "Ödeme doğrulama sırasında hata oluştu." });
        }

        console.log("Full Result Object:", result); // Gelen tüm result objesini yazdır

        // Doğru kontrol: result.paymentStatus
        const paymentResult = result.paymentStatus === "SUCCESS" ? "success" : "failure";

        if (paymentResult === "success") {
            await Payment.create({
                email: email, // Oturumdan alınan e-posta kaydedilir
                sendData: JSON.stringify(request),
                resultData: paymentResult,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            });
            res.redirect('/login');
        } else {
            console.error("Ödeme başarısız oldu:", {
                errorCode: result.errorCode || "Belirtilmedi",
                errorMessage: result.errorMessage || "Hata mesajı mevcut değil",
                errorGroup: result.errorGroup || "Hata grubu belirtilmedi"
            });

            await Payment.create({
                email: email,
                sendData: JSON.stringify(request),
                resultData: paymentResult,
                startDate: new Date(),
                endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
            });

            res.status(400).send(`
                <h1>Ödeme Başarısız!</h1>
                <p>${result.errorMessage || "Bilinmeyen bir hata oluştu."}</p>
                <p>Hata Kodu: ${result.errorCode || "Yok"}</p>
                <p>Hata Grubu: ${result.errorGroup || "Yok"}</p>
                <a href='/'>Tekrar deneyin</a>
            `);
        }
    });
};

module.exports = { getPaymentPage, createCheckoutForm, handlePaymentCallback };
