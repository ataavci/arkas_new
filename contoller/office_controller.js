const auth_middleware = require("../middleware/auth_middileware");
const CountryData=require("../modals/country_data");
const OfficeDetayInput=require("../modals/office");
const OfficeEmission=require("../modals/ProcessedData");
const sequelize = require('sequelize');
const { Op } = require("sequelize");


const dashboard_page_show = (req, res) => {
    res.render('office/office_dashboard', {
        layout: 'layout/office_layout.ejs',
        imagePath: './public/image/ofisstart.jpg'
    });
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




const getScopePieCharts = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "User session not found." });
        }

        // Kullanıcıya ait verileri al
        const emissions = await OfficeEmission.findAll({
            where: { email },
        });

        if (!emissions.length) {
            return res.status(200).json({ message: "No data available for this user.", data: [] });
        }

        // Scope 1 hesaplaması
        const scope1 = emissions.reduce((total, item) => {
            return (
                total +
                (item.stationary_combustion || 0) +
                (item.mobile_combustion || 0) +
                (item.refrigerants || 0)
            );
        }, 0);

        // Scope 2 hesaplaması
        const scope2 = emissions.reduce((total, item) => {
            return (
                total +
                (item.electricity_consumption || 0) +
                (item.purchased_heat_steam || 0)
            );
        }, 0);

        // Scope 3 hesaplaması
        const scope3 = emissions.reduce((total, item) => {
            return (
                total +
                (item.water_consumption || 0) +
                (item.bottled_water_consumption || 0) +
                (item.paper_consumption || 0) +
                (item.waste_water || 0) +
                (item.solid_waste || 0) +
                (item.business_travel_car || 0) +
                (item.business_travel_taxi || 0) +
                (item.business_travel_train || 0) +
                (item.accommodation || 0) +
                (item.total_commuting || 0)
            );
        }, 0);

        // Sonuçları döndür
        res.status(200).json({
            message: "Data retrieved successfully.",
            data: {
                scope1: scope1.toFixed(2),
                scope2: scope2.toFixed(2),
                scope3: scope3.toFixed(2),
                total: (scope1 + scope2 + scope3).toFixed(2),
            },
        });
    } catch (err) {
        console.error("Error while fetching scope emissions:", err);
        res.status(500).json({ message: "An error occurred while fetching data." });
    }
};


const getMonthlyEmissions = async (req, res) => {
    try {
        // Giriş yapan kullanıcının e-postasını al
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "User session not found." });
        }

        // Verileri ay bazında grupla ve toplamları hesapla
        const emissions = await OfficeEmission.findAll({
            where: { email },
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('date')), 'month'], // Ay bilgisi
                [sequelize.fn('SUM', sequelize.col('total_office_emission_ton')), 'total_emission'] // Toplam emisyon
            ],
            group: ['month'], // Ay bazında grupla
            order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']] // Ay sırasına göre sırala
        });

        // Frontend'de Ocak'tan Aralık'a verileri sıralı göstermek için verileri işleyin
        const monthlyData = Array(12).fill(0); // 12 aylık sıfırdan oluşan dizi
        emissions.forEach(item => {
            const month = item.dataValues.month; // Ay bilgisi
            const totalEmission = parseFloat(item.dataValues.total_emission); // Toplam emisyon
            monthlyData[month - 1] = totalEmission; // Doğru indekse yerleştir
        });

        // Veriyi frontend'e gönder
        res.status(200).json({ data: monthlyData });
    } catch (err) {
        console.error("Error fetching monthly emissions:", err);
        res.status(500).json({ message: "An error occurred while fetching data." });
    }
};


const getMobileConsumptionData =  async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "User session not found." });
        }

        // Kullanıcının verilerini alın
        const consumptionData = await OfficeDetayInput.findAll({
            where: { email },
            attributes: [
                'Total_Monthy_Consumption_L1',
                'Total_Monthy_Consumption_L2',
                'Total_Monthy_Consumption_L3',
                'Total_Monthy_Consumption_L4',
                'Total_Monthy_Consumption_L5',
                'Total_Monthy_Consumption_L6',
                'Total_Monthy_Consumption_L7',
                'Total_Monthy_Consumption_L8',
                'Total_Monthy_Consumption_L9',
                'Total_Monthy_Consumption_L10',
                'Total_Monthy_Consumption_L11',
                'Total_Monthy_Consumption_L12',
            ],
        });

        if (!consumptionData || consumptionData.length === 0) {
            return res.status(200).json({ data: [], message: "No data available for this user." });
        }

        // Hesaplamalar
        const total = consumptionData.reduce(
            (totals, item) => {
                totals.L1 += item.Total_Monthy_Consumption_L1 * 2.346 || 0;
                totals.L2 += item.Total_Monthy_Consumption_L2 * 2.379 || 0;
                totals.L3 += item.Total_Monthy_Consumption_L3 * 2.262 || 0;
                totals.L4 += item.Total_Monthy_Consumption_L4 * 2.649 || 0;
                totals.L5 += item.Total_Monthy_Consumption_L5 * 2.650 || 0;
                totals.L6 += item.Total_Monthy_Consumption_L6 * 2.63 || 0;
                totals.L7 += item.Total_Monthy_Consumption_L7 * 2.346 || 0;
                totals.L8 += item.Total_Monthy_Consumption_L8 * 2.379 || 0;
                totals.L9 += item.Total_Monthy_Consumption_L9 * 2.62 || 0;
                totals.L10 += item.Total_Monthy_Consumption_L10 * 2.344 || 0;
                totals.L11 += item.Total_Monthy_Consumption_L11 * 2.340 || 0;
                totals.L12 += item.Total_Monthy_Consumption_L12 * 2.339 || 0;
                return totals;
            },
            {
                L1: 0,
                L2: 0,
                L3: 0,
                L4: 0,
                L5: 0,
                L6: 0,
                L7: 0,
                L8: 0,
                L9: 0,
                L10: 0,
                L11: 0,
                L12: 0,
            }
        );

        // Kategoriler ve değerleri frontend için hazırlayın
        const categories = [
            'Gasoline Passenger Car',
            'Gasoline Light Duty Truck',
            'Gasoline Heavy Duty Truck',
            'Diesel Passenger Car',
            'Diesel Light Duty Truck',
            'Diesel Heavy Duty Truck',
            'Hybrid Passenger Car',
            'Electric Vehicle Duty Truck',
            'Electric Heavy Duty Truck',
            'Gasoline Agricultural Equipment',
            'Gasoline Ships and Boat',
            'Gasoline Motorcycle',
        ];

        const values = [
            total.L1,
            total.L2,
            total.L3,
            total.L4,
            total.L5,
            total.L6,
            total.L7,
            total.L8,
            total.L9,
            total.L10,
            total.L11,
            total.L12,
        ];

        res.status(200).json({ categories, values });
    } catch (err) {
        console.error("Error fetching mobile consumption data:", err);
        res.status(500).json({ message: "An error occurred while fetching data." });
    }
};


const getMonthlyScopesData = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "User session not found." });
        }

        const rawData = await OfficeEmission.findAll({
            where: { email },
            attributes: [
                [sequelize.fn('MONTH', sequelize.col('date')), 'month'],
                [sequelize.fn('SUM', sequelize.col('stationary_combustion')), 'scope1_stationary'],
                [sequelize.fn('SUM', sequelize.col('mobile_combustion')), 'scope1_mobile'],
                [sequelize.fn('SUM', sequelize.col('purchased_heat_steam')), 'scope2_heat'],
                [sequelize.fn('SUM', sequelize.col('electricity_consumption')), 'scope2_electricity'],
                [sequelize.fn('SUM', sequelize.col('water_consumption')), 'scope3_water'],
                [sequelize.fn('SUM', sequelize.col('bottled_water_consumption')), 'scope3_bottled_water'],
                [sequelize.fn('SUM', sequelize.col('business_travel_car')), 'scope3_travel_car'],
                [sequelize.fn('SUM', sequelize.col('business_travel_train')), 'scope3_travel_train'],
            ],
            group: [sequelize.fn('MONTH', sequelize.col('date'))],
            order: [[sequelize.fn('MONTH', sequelize.col('date')), 'ASC']],
            raw: true,
        });

        const monthsMap = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Tüm aylar için varsayılan veri yapısı
        const months = monthsMap.map((month, index) => ({
            month: month,
            scope1: 0,
            scope2: 0,
            scope3: 0,
        }));

        // Gelen verilerle ayları eşleştir
        rawData.forEach((item) => {
            const monthIndex = item.month - 1; // Ay numaraları 1-12 arasında
            months[monthIndex].scope1 =
                parseFloat(item.scope1_stationary || 0) +
                parseFloat(item.scope1_mobile || 0);
            months[monthIndex].scope2 =
                parseFloat(item.scope2_heat || 0) +
                parseFloat(item.scope2_electricity || 0);
            months[monthIndex].scope3 =
                parseFloat(item.scope3_water || 0) +
                parseFloat(item.scope3_bottled_water || 0) +
                parseFloat(item.scope3_travel_car || 0) +
                parseFloat(item.scope3_travel_train || 0);
        });

        res.status(200).json(months);
    } catch (err) {
        console.error("Error fetching monthly scopes data:", err);
        res.status(500).json({ message: "An error occurred while fetching data." });
    }
};

const getScopeData = async (req, res) => {
    try {
        // Retrieve the user's email from the session
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            console.log("Session information not found.");
            return res.status(403).json({ message: "User session not found." });
        }

        console.log("User email:", email);

        // Fetch emission data for the user
        const emissionData = await OfficeEmission.findAll({
            where: { email },
            attributes: [
                'date',
                'stationary_combustion',
                'mobile_combustion',
                'refrigerants',
                'electricity_consumption',
                'purchased_heat_steam',
                'water_consumption',
                'bottled_water_consumption',
                'paper_consumption',
                'waste_water',
                'solid_waste',
                'domestic_flight',
                'short_haul_economy',
                'short_haul_business',
                'long_haul_economy',
                'long_haul_business',
                'continental_economy',
                'continental_business',
                'business_travel_car',
                'business_travel_taxi',
                'business_travel_train',
                'total_commuting',
            ],
            raw: true
        });

        if (!emissionData.length) {
            console.log("No data found for the user.");
            return res.status(200).json({ message: "No data found for the user.", data: {} });
        }

        console.log("Emission Data:", emissionData);

        // Prepare the grouped data structure
        const groupedData = {
            Scope1: {
                StationaryCombustion: Array(12).fill(0),
                MobileCombustion: Array(12).fill(0),
                FugitiveEmissions: Array(12).fill(0),
                Total: Array(12).fill(0),
            },
            Scope2: {
                PurchasedElectricity: Array(12).fill(0),
                PurchasedHeatSteam: Array(12).fill(0),
                Total: Array(12).fill(0),
            },
            Scope3: {
                PurchasedGoods: Array(12).fill(0),
                WasteGenerated: Array(12).fill(0),
                Air: Array(12).fill(0),
                OtherTravelModes: Array(12).fill(0),
                EmployeeCommuting: Array(12).fill(0),
                Total: Array(12).fill(0),
            },
        };

        // Populate the grouped data with monthly values
        emissionData.forEach((data) => {
            const month = data.date ? new Date(data.date).getMonth() : null;
            if (month === null || isNaN(month)) {
                console.log("Invalid date data:", data.date);
                return;
            }

            // Scope 1
            groupedData.Scope1.StationaryCombustion[month] += (data.stationary_combustion || 0) / 1000;
            groupedData.Scope1.MobileCombustion[month] += (data.mobile_combustion || 0) / 1000;
            groupedData.Scope1.FugitiveEmissions[month] += (data.refrigerants || 0) / 1000;
            groupedData.Scope1.Total[month] =
                groupedData.Scope1.StationaryCombustion[month] +
                groupedData.Scope1.MobileCombustion[month] +
                groupedData.Scope1.FugitiveEmissions[month];

            // Scope 2
            groupedData.Scope2.PurchasedElectricity[month] += (data.electricity_consumption || 0) / 100;
            groupedData.Scope2.PurchasedHeatSteam[month] += (data.purchased_heat_steam || 0) / 1000;
            groupedData.Scope2.Total[month] =
                groupedData.Scope2.PurchasedElectricity[month] +
                groupedData.Scope2.PurchasedHeatSteam[month];

            // Scope 3
            groupedData.Scope3.PurchasedGoods[month] +=
                (data.water_consumption || 0) +
                (data.bottled_water_consumption || 0) +
                (data.paper_consumption || 0);
            groupedData.Scope3.WasteGenerated[month] +=
                (data.waste_water || 0) + (data.solid_waste || 0);
            groupedData.Scope3.Air[month] +=
                ((data.domestic_flight || 0) +
                    (data.short_haul_economy || 0) +
                    (data.short_haul_business || 0) +
                    (data.long_haul_economy || 0) +
                    (data.long_haul_business || 0) +
                    (data.continental_economy || 0) +
                    (data.continental_business || 0)) /
                1000;
            groupedData.Scope3.OtherTravelModes[month] +=
                ((data.business_travel_car || 0) +
                    (data.business_travel_taxi || 0) +
                    (data.business_travel_train || 0)) /
                1000;
            groupedData.Scope3.EmployeeCommuting[month] += (data.total_commuting || 0) / 1000;
            groupedData.Scope3.Total[month] =
                groupedData.Scope3.PurchasedGoods[month] +
                groupedData.Scope3.WasteGenerated[month] +
                groupedData.Scope3.Air[month] +
                groupedData.Scope3.OtherTravelModes[month] +
                groupedData.Scope3.EmployeeCommuting[month];
        });

        console.log("Grouped Data:", JSON.stringify(groupedData, null, 2));

        // Send the grouped data as the response
        res.status(200).json(groupedData);
    } catch (error) {
        console.error("Error occurred:", error.message);
        res.status(500).json({ message: "An error occurred.", error: error.message });
    }
};

const getTotalEmission = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            return res.status(403).json({ message: "Kullanıcı oturumu bulunamadı." });
        }

        const totalEmission = await OfficeEmission.sum('total_office_emission_ton', {
            where: { email }
        });

        res.status(200).json({ totalEmission: totalEmission || 0 });
    } catch (error) {
        console.error("Toplam emisyon alınırken hata oluştu:", error.message);
        res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
    }
};
const getTotaloffset = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            console.log("Kullanıcı oturumu bulunamadı.");
            return res.status(403).json({ message: "Kullanıcı oturumu bulunamadı." });
        }

        const totaloffset = await OfficeEmission.sum('offsetcarbon', {
            where: { email }
        });

        console.log("Offset Carbon Total:", totaloffset);

        res.status(200).json({ offsetCarbon: totaloffset || 0 });
    } catch (error) {
        console.error("Toplam offset alınırken hata oluştu:", error.message);
        res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
    }
};
const getOffsetPercentage = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            console.log("Kullanıcı oturumu bulunamadı.");
            return res.status(403).json({ message: "Kullanıcı oturumu bulunamadı." });
        }

        // Toplam emisyon ve offset değerlerini al
        const totalEmission = await OfficeEmission.sum('total_office_emission_ton', {
            where: { email }
        });
        const offsetCarbon = await OfficeEmission.sum('offsetcarbon', {
            where: { email }
        });

        // Yüzdesel hesaplama
        const offsetPercentage = totalEmission
            ? ((offsetCarbon || 0) / totalEmission) * 100
            : 0;

        console.log("Offset Percentage:", offsetPercentage);

        res.status(200).json({ offsetPercentage: offsetPercentage.toFixed(2) });
    } catch (error) {
        console.error("Offset yüzdesi hesaplanırken hata oluştu:", error.message);
        res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
    }
};
const getRemainingCarbon = async (req, res) => {
    try {
        const email = req.session?.user?.email || req.user?.email;
        if (!email) {
            console.log("Kullanıcı oturumu bulunamadı.");
            return res.status(403).json({ message: "Kullanıcı oturumu bulunamadı." });
        }

        // Toplam emisyon ve offset değerlerini al
        const totalEmission = await OfficeEmission.sum('total_office_emission_ton', {
            where: { email }
        });
        const offsetCarbon = await OfficeEmission.sum('offsetcarbon', {
            where: { email }
        });

        // Kalan karbon hesaplama
        const remainingCarbon = (totalEmission || 0) - (offsetCarbon || 0);

        console.log("Remaining Carbon to Neutralize:", remainingCarbon);

        res.status(200).json({ remainingCarbon: remainingCarbon.toFixed(5) });
    } catch (error) {
        console.error("Kalan karbon hesaplanırken hata oluştu:", error.message);
        res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
    }
};


module.exports={
    dashboard_page_show,input_page_show,getCountries,office_calculate,getScopePieCharts,getMonthlyEmissions,getMobileConsumptionData,getMonthlyScopesData
    ,getScopeData,getTotalEmission,getTotaloffset,getOffsetPercentage,getRemainingCarbon
}