const auth_middleware = require("../middleware/auth_middileware");
const CountryData=require("../modals/country_data");
const OfficeDetayInput=require("../modals/office");
const OfficeEmission=require("../modals/ProcessedData");


const dashboard_page_show = (req, res, next) => {
    res.render("office/office_dashboard", { layout: "layout/office_layout.ejs" });
};

const input_page_show = (req, res, next) => {
    res.render("office/office_input", { layout: "layout/office_layout.ejs" });
};

const getCountries = async (req, res) => {
    try {
        const countries = await CountryData.findAll({
            attributes: ['Country', 'Gen_S2']
        });
        res.json(countries);
    } catch (err) {
        console.error('Ülkeler alınırken hata oluştu:', err);
        res.status(500).send('Ülkeler alınırken bir hata oluştu.');
    }
};


const office_calculate= async (req, res) => {
    console.log("Request Body:", req.body);
    try {
        // Giriş yapan kullanıcının e-postasını al
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "Kullanıcı oturumu bulunamadı." });
        }
        const {
            date,
            country,
            
            Electricity_Consumption,
            Water_Consumption,
            Big_Bottled_Water,
            Pet_Water_0_5,
            Pet_Water_1_0,
            Pet_Water_1_5,
            Pet_Water_5_0,
            Printing_Paper,
            toilet_paper,
            solid_waste_management,
            waste_paper_and_cardboard,
            waste_food,
            glass,
            plastic,
            stationary_combustion,
            heating_type,
            heating_central_with_natural_gas,
            Natural_gas_for_heating,
            Air_Conditioner,
            Air_Conditioner_Gas_Load,
            domestic_economy,
            Short_Haul_Economy,
            long_haul_economy,
            Short_haul_Business_Class,
            long_haul_Business_Class,
            Continental_Economy,
            Continental_Business,
            Business_Travel_By_car,
            Business_Travel_By_train,
            Business_Travel_By_taxi,
            Accommodation_for_1_night,
            Vehicle_Own_car,
            Number_of_people1,
            Average_Distance1,
            Vehicle_taxi,
            Number_of_people2,
            Average_Distance2,
            Vehicle_bus,
            Number_of_people3,
            Average_Distance3,
            Vehicle_train,
            Number_of_people4,
            Average_Distance4,
            Vehicle_motorbike,
            Number_of_people5,
            Average_Distance5,
            Vehicle_bike,
            Number_of_people6,
            Average_Distance6,
            Vehicle_by_walk,
            Number_of_people7,
            Average_Distance7,
            Vehicle_Type_Gasoline_passenger_car,
            Pcs1,
            Total_Monthy_Consumption_L1,
            Vehicle_Type_Gasoline_Light_Duty_Truck,
            Pcs2,
            Total_Monthy_Consumption_L2,
            Vehicle_Type_Gasoline_Heavy_Duty_Truck,
            Pcs3,
            Total_Monthy_Consumption_L3,
            Vehicle_Type_Diesel_passenger_car,
            Pcs4,
            Total_Monthy_Consumption_L4,
            Vehicle_Type_Diesel_Light_Duty_Truck,
            Pcs5,
            Total_Monthy_Consumption_L5,
            Vehicle_Type_Diesel_Heavy_Duty_Truck,
            Pcs6,
            Total_Monthy_Consumption_L6,
            Vehicle_Type_Hybrid_passenger_car,
            Pcs7,
            Total_Monthy_Consumption_L7,
            Vehicle_Type_EV_Duty_Truck,
            Pcs8,
            Total_Monthy_Consumption_L8,
            Vehicle_Type_EV_Heavy_Duty_Truck,
            Pcs9,
            Total_Monthy_Consumption_L9,
            Vehicle_Type_Gasoline_Agricultural_Equipment,
            Pcs10,
            Total_Monthy_Consumption_L10,
            Vehicle_Type_Gasoline_Ships_andBoat,
            Pcs11,
            Total_Monthy_Consumption_L11,
            Vehicle_Type_Gasoline_Motorcycle,
            Pcs12,
            Total_Monthy_Consumption_L12,
            Vehicle_Type_Gasoline_Other,
            Pcs13,
            Total_Monthy_Consumption_L13
        } = req.body;
        if (!date) {
            throw new Error("The `date` field is required.");
        }

        // 1. Veritabanından ülkeye göre `Gen_S2` değerini çek
        const countryData = await CountryData.findOne({
            where: { Country: country },
            attributes: ["Gen_S2"],
          });
      
          if (!countryData || !countryData.Gen_S2) {
            throw new Error(`Çarpan değeri ${country} için bulunamadı.`);
          }

      
        
        // 2. Elektrik tüketimini `Gen_S2` ile çarp
        
        const processedElectricityConsumption = Electricity_Consumption *countryData.Gen_S2;
        const proccedwaterconsumption = Water_Consumption * 0.170;
        const proccedbottled_water_consumption= Big_Bottled_Water*0.15*19+Pet_Water_0_5*0.21*0.5+Pet_Water_1_0*0.21*1+
        Pet_Water_1_5*0.21*1.5+Pet_Water_5_0*0.21*5;
        const proccedpaper_consumption=Printing_Paper*1.090*2.4+toilet_paper*0.15*0.93;
        const proccedwaste_water=Water_Consumption*0.201;
        let proceedsolid_waste;

if (solid_waste_management === "yes") {
    proceedsolid_waste = 0;  // Burada solid_waste yerine proceedsolid_waste kullanılmalı
} else {
    proceedsolid_waste = ((waste_paper_and_cardboard * 314) + 
                         (waste_food * 680) + 
                         (glass * 25.78) + 
                         (plastic * 34.08))/1000;
}
        const proccedstationary_combustion= stationary_combustion*0.181;
        const proccedheating_central_with_natural_gas=heating_central_with_natural_gas*0.181;
        const proccedmobile_combustion=Total_Monthy_Consumption_L1*2.346+Total_Monthy_Consumption_L2*2.379+
        Total_Monthy_Consumption_L3*2.262+Total_Monthy_Consumption_L4*2.649+
        Total_Monthy_Consumption_L5*2.650+Total_Monthy_Consumption_L6*2.63+
        Total_Monthy_Consumption_L7*2.346+Total_Monthy_Consumption_L8*2.379+
        Total_Monthy_Consumption_L9*2.62+Total_Monthy_Consumption_L10*2.344+
        Total_Monthy_Consumption_L11*2.340+Total_Monthy_Consumption_L11*2.232+
        Total_Monthy_Consumption_L12*2.339
        let proccedrefrigerants; 
        if (Air_Conditioner_Gas_Load==="no"){
            proccedrefrigerants= 0;
        } else{
            proccedrefrigerants=288*0.0175*Air_Conditioner;
        }
        const procceddomestic_flight=domestic_economy*0.27101;
        const proccedshort_haul_economy=Short_Haul_Economy*0.18196;
        const proccedshort_haul_business=Short_haul_Business_Class*0.27294;
        const proccedlong_haul_economy=long_haul_economy*0.19911;
        const proccedlong_haul_Business_Class=long_haul_Business_Class*0.57;
        const proccedcontinental_economy=Continental_Economy*0.13397;
        const proccedcontinental_business=Continental_Business*0.3885;
        const proccedbusiness_travel_car=Business_Travel_By_car*0.192;
        const proccedbusiness_travel_taxi=Business_Travel_By_taxi*0.193;
        const proccedbusiness_travel_train=Business_Travel_By_train*0.049;
        const proccedaccommodation=Accommodation_for_1_night*15.13;
        const proccedown_car=Number_of_people1*Average_Distance1*0.1918;
        const proccedtaxi=Number_of_people2*Average_Distance2*0.1619;
        const proccedbus=Number_of_people3*Average_Distance3*0.1017;
        const proccedtrain=Number_of_people4*Average_Distance4*0.0489;
        const proccedmototbike=Number_of_people5*Average_Distance5*0.1198;
        const prccedbike=Average_Distance6*Number_of_people6*0;
        const proccedwalk=Average_Distance7*Number_of_people7*0;
        const proccedtotal_commuting=proccedown_car+proccedtaxi+proccedbus+proccedtrain+proccedmototbike+prccedbike+proccedwalk
        const totaltotal_office_emission_ton = (
            (processedElectricityConsumption || 0) +
            (proccedwaterconsumption || 0) +
            (proccedbottled_water_consumption || 0) +
            (proccedpaper_consumption || 0) +
            (proccedwaste_water || 0) +
            (proceedsolid_waste || 0) +
            (proccedstationary_combustion || 0) +
            (proccedheating_central_with_natural_gas || 0) +
            (proccedmobile_combustion || 0) +
            (proccedrefrigerants || 0) +
            (procceddomestic_flight || 0) +
            (proccedshort_haul_economy || 0) +
            (proccedshort_haul_business || 0) +
            (proccedlong_haul_economy || 0) +
            (proccedlong_haul_Business_Class || 0) +
            (proccedcontinental_economy || 0) +
            (proccedcontinental_business || 0) +
            (proccedbusiness_travel_car || 0) +
            (proccedbusiness_travel_taxi || 0) +
            (proccedbusiness_travel_train || 0) +
            (proccedaccommodation || 0) +
            (proccedown_car || 0) +
            (proccedtaxi || 0) +
            (proccedbus || 0) +
            (proccedtrain || 0) +
            (proccedmototbike || 0) +
            (prccedbike || 0) +
            (proccedwalk || 0)
          );
          console.log("Toplam Emisyon (ton):", totaltotal_office_emission_ton);
          
        console.log("Toplam Emisyon (ton):", totaltotal_office_emission_ton);
        

        const totaltotal_office_emission_kg = totaltotal_office_emission_ton * 1000;



        // 3. Verileri ilk tabloya (orijinal haliyle) kaydet
        await OfficeDetayInput.create({
            date,
            email,
            country,
            Electricity_Consumption,
            Water_Consumption,
            Big_Bottled_Water,
            Pet_Water_0_5,
            Pet_Water_1_0,
            Pet_Water_1_5,
            Pet_Water_5_0,
            Printing_Paper,
            toilet_paper,
            solid_waste_management,
            waste_paper_and_cardboard,
            waste_food,
            glass,
            plastic,
            stationary_combustion,
            heating_type,
            heating_central_with_natural_gas,
            Natural_gas_for_heating,
            Air_Conditioner,
            Air_Conditioner_Gas_Load,
            domestic_economy,
            Short_Haul_Economy,
            long_haul_economy,
            Short_haul_Business_Class,
            long_haul_Business_Class,
            Continental_Economy,
            Continental_Business,
            Business_Travel_By_car,
            Business_Travel_By_taxi,
            Business_Travel_By_train,
            Accommodation_for_1_night,
            Vehicle_Own_car,
            Number_of_people1,
            Average_Distance1,
            Vehicle_taxi,
            Number_of_people2,
            Average_Distance2,
            Vehicle_bus,
            Number_of_people3,
            Average_Distance3,
            Vehicle_train,
            Number_of_people4,
            Average_Distance4,
            Vehicle_motorbike,
            Number_of_people5,
            Average_Distance5,
            Vehicle_bike,
            Number_of_people6,
            Average_Distance6,
            Vehicle_by_walk,
            Number_of_people7,
            Average_Distance7,
            Vehicle_Type_Gasoline_passenger_car,
            Pcs1,
            Total_Monthy_Consumption_L1,
            Vehicle_Type_Gasoline_Light_Duty_Truck,
            Pcs2,
            Total_Monthy_Consumption_L2,
            Vehicle_Type_Gasoline_Heavy_Duty_Truck,
            Pcs3,
            Total_Monthy_Consumption_L3,
            Vehicle_Type_Diesel_passenger_car,
            Pcs4,
            Total_Monthy_Consumption_L4,
            Vehicle_Type_Diesel_Light_Duty_Truck,
            Pcs5,
            Total_Monthy_Consumption_L5,
            Vehicle_Type_Diesel_Heavy_Duty_Truck,
            Pcs6,
            Total_Monthy_Consumption_L6,
            Vehicle_Type_Hybrid_passenger_car,
            Pcs7,
            Total_Monthy_Consumption_L7,
            Vehicle_Type_EV_Duty_Truck,
            Pcs8,
            Total_Monthy_Consumption_L8,
            Vehicle_Type_EV_Heavy_Duty_Truck,
            Pcs9,
            Total_Monthy_Consumption_L9,
            Vehicle_Type_Gasoline_Agricultural_Equipment,
            Pcs10,
            Total_Monthy_Consumption_L10,
            Vehicle_Type_Gasoline_Ships_andBoat,
            Pcs11,
            Total_Monthy_Consumption_L11,
            Vehicle_Type_Gasoline_Motorcycle,
            Pcs12,
            Total_Monthy_Consumption_L12,
            Vehicle_Type_Gasoline_Other,
            Pcs13,
            Total_Monthy_Consumption_L13
        });

        // 4. İşlenmiş veriyi ikinci tabloya kaydet
        await OfficeEmission.create({
            date,
            email,
            country,
            electricity_consumption: processedElectricityConsumption,
            water_consumption:proccedwaterconsumption,
            bottled_water_consumption:proccedbottled_water_consumption,
            paper_consumption:proccedpaper_consumption,
            waste_water:proccedwaste_water,
            solid_waste:proceedsolid_waste,
            stationary_combustion:proccedstationary_combustion,
            purchased_heat_steam:proccedheating_central_with_natural_gas,
            mobile_combustion:proccedmobile_combustion,
            refrigerants:proccedrefrigerants,
            domestic_flight:procceddomestic_flight,
            short_haul_economy:proccedshort_haul_economy,
            short_haul_business:proccedshort_haul_business,
            long_haul_economy:proccedlong_haul_economy,
            long_haul_business:proccedlong_haul_Business_Class,
            continental_economy:proccedcontinental_economy,
            continental_business:proccedcontinental_business,
            business_travel_car:proccedbusiness_travel_car,
            business_travel_taxi:proccedbusiness_travel_taxi,
            business_travel_train :proccedbusiness_travel_train,
            accommodation:proccedaccommodation,
            own_car:proccedown_car,
            taxi:proccedtaxi,
            bus:proccedbus,
            train:proccedtrain,
            motorbike:proccedmototbike,
            bike:prccedbike,
            walk:proccedwalk,
            total_commuting:proccedtotal_commuting,
            total_office_emission_ton:totaltotal_office_emission_ton,
            total_office_emission_kg: totaltotal_office_emission_kg,





            
        });
        console.log("processedElectricityConsumption:", processedElectricityConsumption);
console.log("proccedwaterconsumption:", proccedwaterconsumption);
console.log("proccedbottled_water_consumption:", proccedbottled_water_consumption);
// Tüm değişkenleri tek tek loglayın


        res.status(201).json({ message: "İşlem Başarılı!" });

    } catch (err) {
        console.error("Veri kaydedilirken hata oluştu:", err);
        res.status(500).json({ message: "Veri kaydedilirken bir hata oluştu." });
    }
};


module.exports={
    dashboard_page_show,input_page_show,getCountries,office_calculate
}