const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../db/db");

const USER = sequelize.define("customer_lists", {
    emailactive: {
        type: DataTypes.BOOLEAN,  // BOOLEAN tipi kullanılıyor
        allowNull: true,
        defaultValue: false  // Varsayılan değer false
    },
    
    email: {
        type: DataTypes.STRING,
        primaryKey: true,  
        allowNull: false,  
        validate: {
            isEmail: true 
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tel_num: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false // Şifre zorunlu olsun
    },
    service_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // Otomatik olarak kayıt oluşturma zamanını ayarlar
    }
});

// Tablonun veritabanında güncellenmesi
async function sync() {
    try {
        await USER.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();

module.exports = USER;
