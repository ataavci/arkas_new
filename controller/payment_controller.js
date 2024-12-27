const { v4: uuidv4 } = require('uuid');
const Iyzipay = require('iyzipay');
require('dotenv').config();
const Payment = require('../models/payment'); // Payment modelini içe aktar
const moment = require('moment'); 

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
        const price = (priceUSD * STATIC_EXCHANGE_RATE).toFixed(2); // USD -> TRY
        const currency = "TRY";

        const startDate = moment();
        const endDate = moment().add(30, 'days');

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
                registerCard: registerCard || '0'
            },
            buyer: {
                id: buyerInfo.id || uuidv4(),
                name: buyerInfo.name || "Unknown",
                surname: buyerInfo.surname || "Unknown",
                gsmNumber: buyerInfo.gsmNumber || "+905350000000",
                email: buyerInfo.email || "email@email.com",
                identityNumber: buyerInfo.identityNumber || "74300864791",
                lastLoginDate: moment().format("YYYY-MM-DD HH:mm:ss"),
                registrationDate: moment().subtract(1, 'years').format("YYYY-MM-DD HH:mm:ss"),
                registrationAddress: buyerInfo.registrationAddress || "Default Address",
                ip: req.ip || '85.34.78.112',
                city: buyerInfo.city || "Istanbul",
                country: buyerInfo.country || "Turkey",
                zipCode: buyerInfo.zipCode || "34732"
            },
            shippingAddress,
            billingAddress,
            basketItems: [
                {
                    id: 'BI101',
                    name: 'Binocular',
                    category1: 'Collectibles',
                    category2: 'Accessories',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                    price
                }
            ]
        };

        iyzipay.payment.create(data, async function (err, result) {
            const paymentResult = result?.status === "success" ? "success" : "failure";

            // İstek ve yanıt verilerini tabloya kaydet
            await Payment.create({
                sendData: JSON.stringify(data),
                resultData: paymentResult, // Sadece "success" veya "failure" kaydediliyor
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
            });

            if (err) {
                console.error("Ödeme sırasında bir hata oluştu:", err);
                return res.status(500).json({ error: "Ödeme işlemi başarısız.", details: err });
            }

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



const foreignPayment = async (req, res) => {
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
                email: buyerInfo.email || "email@email.com",
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

        iyzipay.payment.create(data, async function (err, result) {
            const paymentResult = result?.status === "success" ? "success" : "failure";

            // İstek ve yanıt verilerini tabloya kaydet
            await Payment.create({
                sendData: JSON.stringify(data),
                resultData: paymentResult, // Sadece "success" veya "failure" kaydediliyor
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
            });

            if (err) {
                console.error("Ödeme sırasında bir hata oluştu:", err);
                return res.status(500).json({ error: "Ödeme işlemi başarısız.", details: err });
            }

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

module.exports = { localPayment, foreignPayment };
