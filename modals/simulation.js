const { DataTypes } = require("sequelize");
const sequelize = require("../db/db"); // Sequelize bağlantısının bulunduğu dosya

const simulation = sequelize.define("simulations", {
  
  user_id: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  expedition: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  vessel_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  dwt: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  from_port: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  to_port: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50), 
    allowNull: true,
  },
  departure: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  arrivel: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  distance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  distance_eca: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  port_day: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
    day_of_sea: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  daily_consumption_at_sea: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  daily_consumption_at_port: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  sea_fuel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  eca_fuel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  port_fuel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sea_consumption: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  eca_consumption: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  port_consumption: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_100_sea: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_50_sea: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_100_eca: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_50_eca: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_100_port: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  consumption_0_port: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  zeroSeaConsumption: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  zeroEcaConsumption: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  ets: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Fuel_Consumption_Total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  TTW: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  WTT: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  GHG_ACTUAL: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  COMPLIANCE_BALANCE: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  fuel_eu: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
})
async function sync() {
    try {
        await simulation.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();

module.exports = simulation;
