const { DataTypes } = require("sequelize");
const sequelize = require("../db/db"); // Veritabanı bağlantınızın doğru olduğundan emin olun

const CountryData = sequelize.define('el_ef', {  // Tablo adı doğru mu?
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CntryCode: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Gen_S2: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
}, {
    tableName: 'el_ef', // Veritabanındaki tablo adının 'el_ef' olduğundan emin olun
    timestamps: false
});

module.exports = CountryData;
