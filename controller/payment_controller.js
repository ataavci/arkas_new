const { v4: uuidv4 } = require('uuid');
const Iyzipay = require('iyzipay');
require('dotenv').config();
const Payment = require('../models/payment'); // Payment modelini içe aktar
const moment = require('moment'); // Tarih hesaplama için kullanılabilir

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY,
    secretKey: process.env.IYZIPAY_SECRET_KEY,
    uri: process.env.IYZIPAY_URI
});

const STATIC_EXCHANGE_RATE = 35.50;

const payment = async (req, res) => {
    const id = uuidv4();
    const { priceUSD, cardUserName, cardNumber, expireMonth, expireYear, cvc, registerCard } = req.body;

    if (!priceUSD || !cardUserName || !cardNumber || !expireMonth || !expireYear || !cvc) {
        return res.status(400).json({ error: "Eksik veya geçersiz bilgi gönderildi." });
    }

    try {
        const price = (priceUSD * STATIC_EXCHANGE_RATE).toFixed(2); // USD -> TRY
        const currency = "TRY";

        // Tarih hesaplama
        const startDate = moment(); // Bugünün tarihi
        const endDate = moment().add(30, 'days'); // Başlangıç tarihine 30 gün eklenir

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
                id: 'BY789',
                name: 'John',
                surname: 'Doe',
                gsmNumber: '+905350000000',
                email: 'email@email.com',
                identityNumber: '74300864791',
                lastLoginDate: '2015-10-05 12:43:35',
                registrationDate: '2013-04-21 15:12:09',
                registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                ip: req.ip || '85.34.78.112',
                city: 'Istanbul',
                country: 'Turkey',
                zipCode: '34732'
            },
            shippingAddress: {
                contactName: 'Jane Doe',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34742'
            },
            billingAddress: {
                contactName: 'Jane Doe',
                city: 'Istanbul',
                country: 'Turkey',
                address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
                zipCode: '34742'
            },
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

        // Ödeme isteği oluştur
        iyzipay.payment.create(data, async function (err, result) {
            // İstek ve yanıt verilerini tabloya kaydet
            await Payment.create({
                sendData: JSON.stringify(data), // İstek verisi
                resultData: JSON.stringify(err || result), // Yanıt verisi
                startDate: startDate.toDate(), // Başlangıç tarihi
                endDate: endDate.toDate() // Bitiş tarihi
            });

            if (err) {
                console.error("Ödeme sırasında bir hata oluştu:", err);
                return res.status(500).json({ error: "Ödeme işlemi başarısız.", details: err });
            }

            console.log("Ödeme sonucu:", result);

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

module.exports = { payment };
