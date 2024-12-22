const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const SimulationSummary = sequelize.define("simulation_summaries", {
  expedition: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  total_port_day: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_day_of_sea: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_days: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_ets: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_compliance_balance: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_fuel_eu: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  times_per_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  to_port_status: {
    type: DataTypes.TEXT, // Liman durumu JSON olarak saklanır
    allowNull: false,
  },
  last_port_status: {
    type: DataTypes.STRING(50), // "Limanda" veya "Seyirde" olacak
    allowNull: false,
  },
});

async function sync() {
  try {
    await SimulationSummary.sync({ alter: true });
    console.log("SimulationSummary tablosu başarıyla oluşturuldu.");
  } catch (err) {
    console.error("SimulationSummary tablosu oluşturulurken hata oluştu:", err);
  }
}
sync();

module.exports = SimulationSummary;
