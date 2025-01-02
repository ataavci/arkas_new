const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/db");

const Payment = sequelize.define("payment", {
    email: {
        type: DataTypes.STRING,
        allowNull: false, // NOT NULL olarak tanımlı
    },
    sendData: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    resultData: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
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
