const { DataTypes } = require('sequelize');
const sequelize = require('../db/db');  // Veritabanı bağlantısı

const OfficeEmission = sequelize.define('office_emission', {
    
    email: {
        type: DataTypes.STRING,
        allowNull: false  // Boş bırakılabilir
    },
    electricity_consumption: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    water_consumption: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    bottled_water_consumption: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    paper_consumption: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    waste_water: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    solid_waste: {
        type: DataTypes.FLOAT,
        allowNull: true  // Zaten boş bırakılabilir
    },
    stationary_combustion: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    purchased_heat_steam: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    mobile_combustion: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    refrigerants: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    domestic_flight: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    short_haul_economy: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    short_haul_business: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    long_haul_economy: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    long_haul_business: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    continental_economy: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    continental_business: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    business_travel_car: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    business_travel_taxi: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    business_travel_train: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    accommodation: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    own_car: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    taxi: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    bus: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    train: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    motorbike: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    total_commuting: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    total_office_emission_kg: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    },
    total_office_emission_ton: {
        type: DataTypes.FLOAT,
        allowNull: true  // Boş bırakılabilir
    }
}, {
    tableName: 'office_emission',
    timestamps: false  // Zaman damgası otomatik eklenmesin
});
async function sync() {
    try {
        await OfficeEmission.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();

module.exports = OfficeEmission;


