const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const FuelData = sequelize.define("fueldata", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Pathway_Name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Fuel_Class: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  LCV: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  E_gCO2eq_MJ: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  CO2eqWTT: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Fuel_Consumer_Unit_Class: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  Cf_CO2_ggFuel: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Cf_CH4_gFuel: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Cf_N2O_gFuel: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Cslip: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Cf_CO2eq_TtW: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  CO2eqTTW: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  Fuel_Price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

async function sync() {
  try {
    await FuelData.sync({ alter: true }); // fueldata yerine FuelData kullanılıyor
    console.log("FuelData tablosu başarıyla oluşturuldu.");
  } catch (err) {
    console.error("Tablo oluşturulurken bir hata oluştu:", err);
  }
}

sync();

module.exports = FuelData;
