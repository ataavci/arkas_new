
const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");



const PortData = sequelize.define('portdata', {
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    port: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false
        
    }
} );

async function sync() {
    try {
        await PortData.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
} 
sync();  
 
 
module.exports = PortData;



