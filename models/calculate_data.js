const { DataTypes } = require('sequelize');


const sequelize = require('../db/db');  // Veritabanı bağlantısı
const CalculateData = sequelize.define('calculatedata', {
        user_email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        vessel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        start: {
            type: DataTypes.DATE,
            allowNull:true,
        },
        finish: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        carbon_price: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        from: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        to: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FUEL_TYPE_SEA: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        CONSUPTION_SEA: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        FUEL_TYPE_ECA: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        CONS_ECA: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        FUEL_TYPE_PORT: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        CONS_PORT: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        distance: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        dis_eca: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        cargo: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: { 
            type: DataTypes.STRING,
            allowNull: true,
        },
       emission: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        tax: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        ttw: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        wtt: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        ghg: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        compliance_balance: { // Düzeltilmiş alan adı
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        fuel_eu: { 
            type: DataTypes.FLOAT,
            allowNull: true,
        },

    });
    async function sync() {
        try {
            await CalculateData.sync({ alter: true});
            console.log("Tablo başarıyla oluşturuldu.");
        } catch (err) {
            console.error("Tablo oluşturulurken bir hata oluştu:", err);
        }
    }
    sync();

module.exports =CalculateData
