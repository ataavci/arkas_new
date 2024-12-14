const { DataTypes, FLOAT } = require('sequelize');
const sequelize = require('../db/db');

const OfficeEmission = sequelize.define('office_emission', {
    email: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATE, allowNull: true },
    electricity_consumption: { type: DataTypes.FLOAT, allowNull: true },
    water_consumption: { type: DataTypes.FLOAT, allowNull: true },
    bottled_water_consumption: { type: DataTypes.FLOAT, allowNull: true },
    paper_consumption: { type: DataTypes.FLOAT, allowNull: true },
    waste_water: { type: DataTypes.FLOAT, allowNull: true },
    solid_waste: { type: DataTypes.FLOAT, allowNull: true },
    stationary_combustion: { type: DataTypes.FLOAT, allowNull: true },
    purchased_heat_steam: { type: DataTypes.FLOAT, allowNull: true },
    mobile_combustion: { type: DataTypes.FLOAT, allowNull: true },
    refrigerants: { type: DataTypes.FLOAT, allowNull: true },
    domestic_flight: { type: DataTypes.FLOAT, allowNull: true },
    short_haul_economy: { type: DataTypes.FLOAT, allowNull: true },
    short_haul_business: { type: DataTypes.FLOAT, allowNull: true },
    long_haul_economy: { type: DataTypes.FLOAT, allowNull: true },
    long_haul_business: { type: DataTypes.FLOAT, allowNull: true },
    continental_economy: { type: DataTypes.FLOAT, allowNull: true },
    continental_business: { type: DataTypes.FLOAT, allowNull: true },
    business_travel_car: { type: DataTypes.FLOAT, allowNull: true },
    business_travel_taxi: { type: DataTypes.FLOAT, allowNull: true },
    business_travel_train: { type: DataTypes.FLOAT, allowNull: true },
    accommodation: { type: DataTypes.FLOAT, allowNull: true },
    own_car: { type: DataTypes.FLOAT, allowNull: true },
    taxi: { type: DataTypes.FLOAT, allowNull: true },
    bus: { type: DataTypes.FLOAT, allowNull: true },
    train: { type: DataTypes.FLOAT, allowNull: true },
    motorbike: { type: DataTypes.FLOAT, allowNull: true },
    total_commuting: { type: DataTypes.FLOAT, allowNull: true },
    total_office_emission_kg: { type: DataTypes.FLOAT, allowNull: true },
    total_office_emission_ton: { type: DataTypes.FLOAT, allowNull: true },
    offsetcarbon:{type:FLOAT, allowNull: true}
}, {
    tableName: 'office_emission',
    timestamps: false
});

async function sync() {
    try {
        console.log("Tablo oluşturuluyor...");
        await OfficeEmission.sync({ alter: true }); // alter veya force kullanılabilir
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err.message);
    }
}

sync();

module.exports = OfficeEmission;
