const { DataTypes } = require("sequelize");
const sequelize = require("../db/db");

const officedetayinput = sequelize.define("office_detay_table", {
   
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
        
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,  // Değiştirildi
    },
    Electricity_Consumption: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Water_Consumption: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Big_Bottled_Water: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Pet_Water_0_5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Pet_Water_1_0: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Pet_Water_1_5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Pet_Water_5_0: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Printing_Paper: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    toilet_paper: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    solid_waste_management: {
        type: DataTypes.STRING,
        allowNull: true,  
    },
    waste_paper_and_cardboard: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    waste_food: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    glass: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    plastic: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    stationary_combustion:{
        type: DataTypes.FLOAT,
        allowNull: true,

    },
    heating_type: {
        type: DataTypes.STRING,
        allowNull: true,  // Değiştirildi
    },
    heating_central_with_natural_gas: {
        type: DataTypes.FLOAT,
        allowNull: true,  // Değiştirildi
    },
    Natural_gas_for_heating: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Air_Conditioner: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Air_Conditioner_Gas_Load: {
        type: DataTypes.STRING,
        allowNull: true,  // Değiştirildi
    },
    domestic_economy: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Short_Haul_Economy: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    long_haul_economy: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Short_haul_Business_Class: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    long_haul_Business_Class: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Continental_Economy: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Continental_Business: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Business_Travel_By_car: {
        type: DataTypes.FLOAT,
        allowNull: true,
        
    },
    Business_Travel_By_taxi: {
        type: DataTypes.FLOAT,
        allowNull: true,
        
    },
    Business_Travel_By_train: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Accommodation_for_1_night: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Own_car: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people1: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance1: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_taxi: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people2: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance2: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    
    Vehicle_bus: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people3: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance3: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_train: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people4: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance4: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_motorbike: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_bike: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people6: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance6: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_by_walk: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    Number_of_people7: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Average_Distance7: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_passenger_car: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs1: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L1: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Light_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs2: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L2: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Heavy_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs3: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L3: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Diesel_passenger_car: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs4: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L4: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Diesel_Light_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L5: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Diesel_Heavy_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs6: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L6: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Hybrid_passenger_car: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs7: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L7: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_EV_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs8: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L8: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_EV_Heavy_Duty_Truck: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs9: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L9: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Agricultural_Equipment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs10: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L10: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Ships_andBoat: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs11: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L11: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Motorcycle: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs12: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L13: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Vehicle_Type_Gasoline_Other: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    Pcs14: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    Total_Monthy_Consumption_L14: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    eklenme_tarihi: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

async function sync() {
    try {
        await officedetayinput.sync({ alter: true });
        console.log("Tablo başarıyla oluşturuldu.");
    } catch (err) {
        console.error("Tablo oluşturulurken bir hata oluştu:", err);
    }
}
sync();

module.exports = officedetayinput;
