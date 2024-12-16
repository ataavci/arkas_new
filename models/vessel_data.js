const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const vessel_data=sequelize.define("vessel_data",{
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    vessel_name:{type: DataTypes.STRING,
        allowNull: false},
    dwt:{
        type: DataTypes.INTEGER,
        allowNull: false

    },
})
async function sync() {
    try {
        await vessel_data.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();
module.exports= vessel_data;