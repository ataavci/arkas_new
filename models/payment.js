const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/db");

const Payment = sequelize.define("payment", {
    sendData: {
        type: DataTypes.TEXT, // JSON verileri TEXT olarak saklanır
        allowNull: false
    },
    resultData: {
        type: DataTypes.TEXT, // JSON verileri TEXT olarak saklanır
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATE, // Ödemenin yapıldığı tarih
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE, // Ödemenin biteceği tarih
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // Otomatik olarak kayıt oluşturulma zamanı
    }
});

async function sync() {
    try {
        await Payment.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();

module.exports = Payment;
