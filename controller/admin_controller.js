const ExcelJS = require('exceljs');
const CalculateData = require('../models/calculate_data');
const ShipsData = require('../models/vessel_data');
const PortData = require('../models/portdata');
const FuelData = require('../models/fueldata'); 
const fs = require('fs');
const sequelize = require("../db/db");
const { Op, fn, col, literal } = require("sequelize");

const parseExcelDate = (excelDate) => {
    if (!excelDate || isNaN(excelDate)) return null;
    const parsedDate = new Date((excelDate - 25569) * 86400 * 1000);
    return parsedDate.toISOString().split('T')[0];
};

const uploadAndProcessExcel = async (req, res) => {
    try {
        if (!req.file) {
            console.log("No file uploaded.");
            return res.status(400).send("No file uploaded. Please select a file.");
        }

        console.log("File successfully uploaded:", req.file.path);

        const userEmail = req.user.email;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const sheet = workbook.worksheets[0];

        const data = [];

        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header row

            const rowData = {};
            row.eachCell((cell, colNumber) => {
                const header = sheet.getRow(1).getCell(colNumber).value;
                rowData[header] = cell.value;
            });

            data.push(rowData);
        });

        if (data.length === 0) {
            console.log("The Excel file is empty.");
            return res.status(400).send("The Excel file is empty.");
        }

        for (const row of data) {
            const startDate = parseExcelDate(row.start);
            const finishDate = parseExcelDate(row.finish);

            const fromPort = await PortData.findOne({ where: { port: row.from } });
            const toPort = await PortData.findOne({ where: { port: row.to } });
            const status = fromPort && toPort ? `${fromPort.status}/${toPort.status}` : "Unknown";

            const fuelTypeSea = row.FUEL_TYPE_SEA;
            const fuelTypePort = row["FUEL TYPE PORT"];

            const fuelSea = fuelTypeSea ? await FuelData.findOne({ where: { Pathway_Name: fuelTypeSea } }) : null;
            const fuelPort = fuelTypePort ? await FuelData.findOne({ where: { Pathway_Name: fuelTypePort } }) : null;

            const emissionSea = row.CONSUPTION_SEA * (fuelSea ? fuelSea.Cf_CO2_ggFuel : 0);
            const emissionPort = row.CONS_PORT * (fuelPort ? fuelPort.Cf_CO2_ggFuel : 0);

            const totalEmission = emissionSea + emissionPort;

            let multiplierStatus;
            if (status === "EU/EU") {
                multiplierStatus = 1;
            } else if (status === "EU/NON-EU" || status === "NON-EU/EU") {
                multiplierStatus = 0.5;
            } else if (status === "NON-EU/NON-EU") {
                multiplierStatus = 0;
            } else {
                multiplierStatus = 0; 
            }

            const carbonPrice = parseFloat(row.carbon_price);

            const taxSea = emissionSea * carbonPrice * multiplierStatus * 0.7;
            const taxPortMultiplier = toPort && toPort.status === "EU" ? 1 : 0;
            const taxPort = emissionPort * carbonPrice * taxPortMultiplier * 0.7;
            const totalTax = taxSea + taxPort;

            const nonTaxEmissionSea = emissionSea * carbonPrice * multiplierStatus;
            const nonTaxEmissionPort = emissionPort * carbonPrice * taxPortMultiplier;

            const Cf_CO2eq_TtW_Sea = fuelSea ? fuelSea.Cf_CO2eq_TtW : 0;
            const Cf_CO2eq_TtW_Port = fuelPort ? fuelPort.Cf_CO2eq_TtW : 0;
            const CO2eqTTWsea = fuelSea ? fuelSea.CO2eqTTW : 0;
            const CO2eqTTWport = fuelPort ? fuelPort.CO2eqTTW : 0;

            const LCV_Sea = fuelSea ? fuelSea.LCV : 0;
            const LCV_Port = fuelPort ? fuelPort.LCV : 0;

            const ttwSea = nonTaxEmissionSea * Cf_CO2eq_TtW_Sea;
            const ttwPort = nonTaxEmissionPort * Cf_CO2eq_TtW_Port;
            const lcvSea = nonTaxEmissionSea * LCV_Sea;
            const lcvPort = nonTaxEmissionPort * LCV_Port;
            const wttsea = nonTaxEmissionSea * LCV_Sea * CO2eqTTWsea;
            const wttport = nonTaxEmissionPort * lcvPort * CO2eqTTWport;

            const wttsea_ = nonTaxEmissionSea * CO2eqTTWsea;
            const wttport_ = nonTaxEmissionPort * CO2eqTTWport;

            const wtt = (wttsea + wttport) / (wttport_ + wttsea_);
            const ttw = (lcvSea + lcvPort) !== 0 ? (ttwSea + ttwPort) / (lcvSea + lcvPort) : 0;
            const ghg = wtt + ttw;
            const complian_balance = (89.34 - ghg) * (nonTaxEmissionSea * LCV_Sea + nonTaxEmissionPort * LCV_Port) * 1000000;
            const fuel_eu = ghg > 89.34 ? Math.abs(complian_balance) / (ghg * 41000) * 2400 : 0;

            await CalculateData.create({
                user_email: userEmail,
                vessel: row.vessel,
                start: startDate,
                finish: finishDate,
                carbon_price: carbonPrice,
                from: row.from,
                to: row.to,
                FUEL_TYPE_SEA: row.FUEL_TYPE_SEA,
                CONSUPTION_SEA: parseFloat(row.CONSUPTION_SEA),
                FUEL_TYPE_ECA: row.FUEL_TYPE_ECA,
                CONS_ECA: parseFloat(row.CONS_ECA),
                FUEL_TYPE_PORT: row["FUEL TYPE PORT"],
                CONS_PORT: parseFloat(row.CONS_PORT),
                distance: parseFloat(row.distance),
                dis_eca: parseFloat(row.dis_eca),
                cargo: parseFloat(row.cargo),
                status: status,
                emission: totalEmission,
                tax: totalTax,
                ttw: ttw,
                wtt: wtt,
                ghg: ghg,
                compliance_balance: complian_balance,
                fuel_eu: fuel_eu
            });
        }

        fs.unlinkSync(req.file.path);
        console.log("File deleted after processing.");
        res.status(200).send("Data processed and saved successfully.");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send(`Error processing data: ${error.message}`);
    }
};

const mainpageshow = function(req, res, next) {
    res.render("admin/yonetim", { layout: "layout/yonetim_layouts.ejs" });
};

const fuelboard = function(req, res, next) {
    res.render("admin/fuel", { layout: "layout/yonetim_layouts.ejs" });
};
const ukpageshow = function(req, res, next) {
    res.render("admin/uk-eu", { layout: "layout/yonetim_layouts.ejs" });
};
const indicatorpageshow = function(req, res, next) {
    res.render("admin/indicator", { layout: "layout/yonetim_layouts.ejs" });
};

const dashboardpage = async (req, res, next) => {
    try {
        const vesselNames = await CalculateData.findAll({
            attributes: ['vessel'],
            group: ['vessel'],
            raw: true
        });

        const records = await CalculateData.findAll({ raw: true });
        const totalConsumptionSea = records.reduce((acc, record) => acc + (record.CONSUPTION_SEA || 0), 0).toFixed(2);
        const totalComplianceBalance = records
            .filter(record => parseInt(record.compliance_balance) <= 0)
            .reduce((acc, record) => acc + parseInt(record.compliance_balance || 0), 0);
        const totalTax = records.reduce((acc, record) => acc + (record.tax || 0), 0).toFixed(2);
        const totalConsumption = (parseFloat(totalConsumptionSea) + parseFloat(records.reduce((acc, record) => acc + (record.CONS_PORT || 0), 0))).toFixed(2);

        const groupedRecords = await CalculateData.findAll({
            attributes: [
                'vessel',
                [sequelize.fn('SUM', sequelize.col('CONSUPTION_SEA')), 'total_consumption'],
                [sequelize.fn('SUM', sequelize.col('compliance_balance')), 'total_compliance_balance']
            ],
            group: ['vessel'],
            raw: true
        });

        const tableData = groupedRecords.map(record => ({
            vesselName: record.vessel,
            totalConsumption: record.total_consumption,
            complianceBalance: record.total_compliance_balance,
            bunkerCost: '123,112',
            fuelEUPenalty: '53,142',
            ets: '78,625',
            cii: 'A'
        }));

        res.render("admin/dashboard", {
            layout: "layout/yonetim_layouts.ejs",
            tableData,
            totalConsumption,
            complianceBalance: totalComplianceBalance,
            totalTax,
            vesselNames
        });
    } catch (error) {
        console.error("Error loading dashboard data:", error);
        res.status(500).render("admin/dashboard", { 
            layout: "layout/yonetim_layouts.ejs",
            tableData: [],
            totalConsumption: "0.00",
            complianceBalance: "0",
            totalTax: "0.00",
            vesselNames: []
        });
    }
};

const getChartData = async (req, res) => {
    try {
        const { vessel, start, end } = req.query;

        
        const whereConditions = {};

       
        if (vessel && vessel !== "all") {
            whereConditions.vessel = vessel;
        }

        
        if (start) {
            whereConditions.start = { [Op.gte]: start };
        }
        if (end) {
            whereConditions.finish = { [Op.lte]: end };
        }

        
        const records = await CalculateData.findAll({
            where: whereConditions,
            attributes: [
                [fn('DATE_FORMAT', col('start'), '%Y-%m'), 'month'],
                'vessel',
                [fn('SUM', col('emission')), 'monthlyEmissions'],
                [fn('SUM', col('tax')), 'monthlyAmountPaid']
            ],
            group: ['month', 'vessel'],
            order: [literal('month')],
            raw: true
        });

        
        const emissionsData = {};
        const amountPaidData = {};

        records.forEach(record => {
            const { month, vessel, monthlyEmissions, monthlyAmountPaid } = record;
            if (!emissionsData[vessel]) emissionsData[vessel] = [];
            if (!amountPaidData[vessel]) amountPaidData[vessel] = [];
            emissionsData[vessel].push({ month, value: monthlyEmissions });
            amountPaidData[vessel].push({ month, value: monthlyAmountPaid });
        });

        res.json({ emissions: emissionsData, amountPaid: amountPaidData });
    } catch (error) {
        console.error("Error fetching chart data:", error);
        res.status(500).json({ error: "Failed to fetch chart data" });
    }
};
const getFuelChartData = async (req, res) => {
    try {
        // Tarihleri URL parametrelerinden alın, değilse son bir ayı kullanın
        let { start, end } = req.query;

        if (!start || !end) {
            const today = new Date();
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            start = lastMonth.toISOString().split('T')[0];
            end = today.toISOString().split('T')[0];
        }

        // Veritabanında tarih aralığına göre sorgulama yap
        const records = await CalculateData.findAll({
            where: {
                createdAt: {
                    [Op.between]: [new Date(start), new Date(end)]
                }
            }
        });

        // Değerleri toplamak için değişkenler
        let ports = 0, between = 0, departed = 0, arrived = 0;

        // Her kaydı döngüye alarak değerlere göre toplamları hesaplayın
        records.forEach(record => {
            ports += record.port_consumption || 0;

            if (record.status === 'EU/EU') {
                between += record.sea_consumption || 0;
            } else if (record.status === 'NON-EU/EU' || record.status === 'EU/NON-EU') {
                departed += record.sea_consumption || 0;
            } else if (record.status === 'NON-EU/NON-EU') {
                arrived += record.sea_consumption || 0;
            }
        });

        // JSON formatında dönen veriyi grafiğe yollamak için render yapıyoruz
        res.json({ ports, between, departed, arrived });
    } catch (error) {
        console.error("Grafik verileri alınırken hata oluştu:", error);
        res.status(500).json({ error: "Sunucu hatası" });
    }
};
const renderFuelPage = (req, res) => {
    try {
        const today = new Date();
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);

        res.render('admin/fuel', { 
            layout: 'layout/yonetim_layouts.ejs',
            defaultStartDate: lastMonth.toISOString().split('T')[0],
            defaultEndDate: today.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        res.status(500).send('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
};
const getFuelConsumptionData = async (req, res) => {
    try {
      
  
      // Step 1: Fetch unique vessels from the CalculateData model
      const vessels = await CalculateData.findAll({
        attributes: [[fn('DISTINCT', col('vessel')), 'vessel']],
        order: [[col('vessel'), 'ASC']],
        raw: true // Ensure the result is a plain object
      });
  
      // Step 2: Get vesselId from query parameters, and filter data accordingly
      const { vesselId } = req.query;
  
      // Build the query filter dynamically
      let whereCondition = {};
      if (vesselId && vesselId !== 'all') {
        whereCondition.vessel = vesselId; // Filtering based on the vessel name
      }
  
      // Step 3: Fetch fuel consumption data grouped by month, optionally filtered by vessel
      const fuelData = await CalculateData.findAll({
        where: whereCondition,
        attributes: [
          [fn('DATE_FORMAT', col('start'), '%Y-%m'), 'month'], // Extract year and month from 'start' column
          [fn('SUM', col('CONSUPTION_SEA')), 'total_sea_consumption'],
          [fn('SUM', col('CONS_PORT')), 'total_port_consumption'],
          [col('FUEL_TYPE_SEA'), 'fuel_type_sea'], // Add fuel type for sea consumption
          [col('FUEL_TYPE_PORT'), 'fuel_type_port'] // Add fuel type for port consumption
        ],
        group: ['month', 'fuel_type_sea', 'fuel_type_port'],
        order: [[literal('month'), 'ASC']], // Order by month in ascending order
        raw: true // Ensure the result is a plain object
      });
  
      // Prepare response data for the chart
      const responseData = {
        vessels: vessels.map(vessel => ({ id: vessel.vessel, name: vessel.vessel })), // List of unique vessels
        months: fuelData.map(item => item.month),
        sea: fuelData.map(item => parseFloat(item.total_sea_consumption)),
        port: fuelData.map(item => parseFloat(item.total_port_consumption)),
        fuelTypeSea: fuelData.map(item => item.fuel_type_sea),
        fuelTypePort: fuelData.map(item => item.fuel_type_port)
      };
  
      console.log("Sending response data to client:", responseData);
  
      // Send the response back to the front-end
      res.status(200).json(responseData);
    } catch (error) {
      console.error('Error fetching fuel consumption data:', error);
      res.status(500).json({ message: 'Server error while fetching fuel consumption data.' });
    }
  };
  const getCO2ChartData = async (req, res) => {
    try {
        console.log("Starting getCO2ChartData...");

        // Adjust table name to match the exact name in the database
        const records = await sequelize.query(
            `SELECT cd.CONS_PORT, cd.CONSUPTION_SEA, cd.status, fd.Cf_CO2_ggFuel 
            FROM calculatedata AS cd
            JOIN fuel_data AS fd ON cd.FUEL_TYPE_SEA = fd.Pathway_Name`,
            { type: sequelize.QueryTypes.SELECT }
        );

        console.log("Records fetched:", records.length);

        // Initialize counters for each CO₂ category
        let ports = 0;
        let between = 0;
        let arrived = 0;
        let departed = 0;

        // Iterate over each record and apply calculations
        records.forEach((record, index) => {
            const fuelFactor = record.Cf_CO2_ggFuel; // CO₂ factor for the fuel type
            console.log(`Record ${index + 1}:`, record);
            console.log(`Fuel Factor for Record ${index + 1}:`, fuelFactor);

            // Calculate port emissions
            if (record.CONS_PORT && fuelFactor) {
                ports += record.CONS_PORT * fuelFactor;
                console.log(`Port emissions after Record ${index + 1}:`, ports);
            }

            // Calculate sea emissions based on status
            if (record.CONSUPTION_SEA && fuelFactor) {
                switch (record.status) {
                    case 'EU/EU':
                        between += record.CONSUPTION_SEA * fuelFactor;
                        console.log(`Between emissions after Record ${index + 1}:`, between);
                        break;
                    case 'NON-EU/EU':
                    case 'EU/NON-EU':
                        arrived += record.CONSUPTION_SEA * fuelFactor;
                        console.log(`Arrived emissions after Record ${index + 1}:`, arrived);
                        break;
                    case 'NON-EU/NON-EU':
                        departed += record.CONSUPTION_SEA * fuelFactor;
                        console.log(`Departed emissions after Record ${index + 1}:`, departed);
                        break;
                    default:
                        console.warn(`Unexpected status: ${record.status}`);
                        break;
                }
            }
        });

        // Log final computed values before sending the response
        console.log("Final Port Emissions:", ports);
        console.log("Final Between Emissions:", between);
        console.log("Final Arrived Emissions:", arrived);
        console.log("Final Departed Emissions:", departed);

        // Return calculated values
        res.json({
            data: [
                { name: 'Ports', value: ports },
                { name: 'Between', value: between },
                { name: 'Arrived', value: arrived },
                { name: 'Departed', value: departed }
            ]
        });
    } catch (error) {
        console.error("Error calculating CO₂ chart data:", error);
        res.status(500).json({ error: "Failed to calculate CO₂ data" });
    }
};
const getVesselVoyagesByDate = async (req, res) => {
    const { year1, year2, quarter, vessels } = req.body; // vessels parametresi eklendi

    try {
        const quarterDates = {
            Q1: ['01-01', '03-31'],
            Q2: ['04-01', '06-30'],
            Q3: ['07-01', '09-30'],
            Q4: ['10-01', '12-31'],
        };

        const [startMonth, endMonth] = quarterDates[quarter];
        const startDateYear1 = `${year1}-${startMonth}`;
        const endDateYear1 = `${year1}-${endMonth}`;
        const startDateYear2 = `${year2}-${startMonth}`;
        const endDateYear2 = `${year2}-${endMonth}`;

        // Filtreye göre gemi isimlerini ekleme
        const vesselFilter = vessels && vessels.length > 0 ? { vessel: { [Op.in]: vessels } } : {};

        // İlk yıl verisi
        const dataYear1 = await CalculateData.findAll({
            where: {
                [Op.and]: [
                    { start: { [Op.gte]: new Date(startDateYear1) } },
                    { finish: { [Op.lte]: new Date(endDateYear1) } },
                    vesselFilter, // Gemi filtresi
                ],
            },
            attributes: ['vessel', 'emission', 'tax', 'ttw', 'wtt', 'cargo', 'distance', 'CONSUPTION_SEA', 'CONS_PORT', 'FUEL_TYPE_SEA', 'FUEL_TYPE_PORT'],
        });

        // İkinci yıl verisi
        const dataYear2 = await CalculateData.findAll({
            where: {
                [Op.and]: [
                    { start: { [Op.gte]: new Date(startDateYear2) } },
                    { finish: { [Op.lte]: new Date(endDateYear2) } },
                    vesselFilter, // Gemi filtresi
                ],
            },
            attributes: ['vessel', 'emission', 'tax', 'ttw', 'wtt', 'cargo', 'distance', 'CONSUPTION_SEA', 'CONS_PORT', 'FUEL_TYPE_SEA', 'FUEL_TYPE_PORT'],
        });

        // ShipsData'dan gemi DWT değerlerini al
        const vesselData = await ShipsData.findAll({
            attributes: ['vessel_name', 'dwt'],
            raw: true,
        });

        const vesselDWTMap = vesselData.reduce((acc, curr) => {
            acc[curr.vessel_name] = curr.dwt;
            return acc;
        }, {});

        // FuelData'dan yakıt bilgilerini al
        const fuelData = await FuelData.findAll({
            attributes: ['Pathway_Name', 'Cf_CH4_gFuel', 'Cf_N2O_gFuel'],
            raw: true,
        });

        const fuelCH4Map = fuelData.reduce((acc, curr) => {
            acc[curr.Pathway_Name] = curr.Cf_CH4_gFuel;
            return acc;
        }, {});

        const fuelN2OMap = fuelData.reduce((acc, curr) => {
            acc[curr.Pathway_Name] = curr.Cf_N2O_gFuel;
            return acc;
        }, {});

        // CH4 Hesaplama Fonksiyonu
        const calculateCH4 = (seaFuel, portFuel, seaFuelType, portFuelType) => {
            const seaCH4 = seaFuel && seaFuelType ? (seaFuel * 1000 * (fuelCH4Map[seaFuelType] || 0)) : 0; // ton -> kg
            const portCH4 = portFuel && portFuelType ? (portFuel * 1000 * (fuelCH4Map[portFuelType] || 0)) : 0; // ton -> kg
            return (seaCH4 + portCH4).toFixed(2); // Toplam CH4 (kg)
        };

        // CH4 Intensity Hesaplama Fonksiyonu
        const calculateCH4Intensity = (ch4, cargo, distance) => {
            if (!ch4 || !cargo || !distance || distance === 0) return "-";
            const ch4Milligrams = ch4 * 1e6; // CH4 değerini miligrama çevir
            return (ch4Milligrams / (cargo * distance)).toFixed(2); // CH4 Intensity hesaplama
        };

        // N2O Hesaplama Fonksiyonu
        const calculateN2O = (seaFuel, portFuel, seaFuelType, portFuelType) => {
            const seaN2O = seaFuel && seaFuelType ? (seaFuel * 1000 * (fuelN2OMap[seaFuelType] || 0)) : 0; // ton -> kg
            const portN2O = portFuel && portFuelType ? (portFuel * 1000 * (fuelN2OMap[portFuelType] || 0)) : 0; // ton -> kg
            return (seaN2O + portN2O).toFixed(2); // Toplam N2O (kg)
        };

        // N2O Intensity Hesaplama Fonksiyonu
        const calculateN2OIntensity = (n2o, cargo, distance) => {
            if (!n2o || !cargo || !distance || distance === 0) return "-";
            const n2oMilligrams = n2o * 1e6; // N2O değerini miligrama çevir
            return (n2oMilligrams / (cargo * distance)).toFixed(2); // N2O Intensity hesaplama
        };

        // Hesaplama fonksiyonları
        const calculateEEOI = (emission, cargo, distance) => {
            if (!emission || !cargo || !distance || distance === 0) return "-";
            const emissionGrams = emission * 1e6; // Emission değerini grama çevir (ton -> gram)
            return (emissionGrams / (cargo * distance)).toFixed(2); // EEOI hesaplaması
        };

        const calculateAER = (emission, dwt, distance) => {
            if (!emission || !dwt || !distance || distance === 0) return "-";
            const emissionGrams = emission * 1e6; // Emission değerini grama çevir
            return (emissionGrams / (dwt * distance)).toFixed(2); // AER hesaplaması
        };

        const calculateTransportWork = (cargo, distance) => {
            if (!cargo || !distance || distance === 0) return "-";
            return (cargo * distance).toFixed(2); // Transport Work hesaplama
        };

        const calculateTransportWorkDWT = (dwt, distance) => {
            if (!dwt || !distance || distance === 0) return "-";
            return (dwt * distance).toFixed(2); // Transport Work DWT hesaplama
        };

        // Year 1 için hesaplamalar
        const year1DataWithMetrics = dataYear1.map((item) => {
            const dwt = vesselDWTMap[item.vessel] || null;
            const ch4Value = calculateCH4(item.CONSUPTION_SEA, item.CONS_PORT, item.FUEL_TYPE_SEA, item.FUEL_TYPE_PORT);
            const n2oValue = calculateN2O(item.CONSUPTION_SEA, item.CONS_PORT, item.FUEL_TYPE_SEA, item.FUEL_TYPE_PORT);
            return {
                ...item.toJSON(),
                eeoi: calculateEEOI(item.emission, item.cargo, item.distance),
                aer: calculateAER(item.emission, dwt, item.distance),
                transportWork: calculateTransportWork(item.cargo, item.distance),
                transportWorkDWT: calculateTransportWorkDWT(dwt, item.distance),
                ch4: ch4Value, // CH4 hesaplama
                ch4Intensity: calculateCH4Intensity(ch4Value, item.cargo, item.distance), // CH4 Intensity hesaplama
                n2o: n2oValue, // N2O hesaplama
                n2oIntensity: calculateN2OIntensity(n2oValue, item.cargo, item.distance), // N2O Intensity hesaplama
            };
        });

        // Year 2 için hesaplamalar
        const year2DataWithMetrics = dataYear2.map((item) => {
            const dwt = vesselDWTMap[item.vessel] || null;
            const ch4Value = calculateCH4(item.CONSUPTION_SEA, item.CONS_PORT, item.FUEL_TYPE_SEA, item.FUEL_TYPE_PORT);
            const n2oValue = calculateN2O(item.CONSUPTION_SEA, item.CONS_PORT, item.FUEL_TYPE_SEA, item.FUEL_TYPE_PORT);
            return {
                ...item.toJSON(),
                eeoi: calculateEEOI(item.emission, item.cargo, item.distance),
                aer: calculateAER(item.emission, dwt, item.distance),
                transportWork: calculateTransportWork(item.cargo, item.distance),
                transportWorkDWT: calculateTransportWorkDWT(dwt, item.distance),
                ch4: ch4Value, // CH4 hesaplama
                ch4Intensity: calculateCH4Intensity(ch4Value, item.cargo, item.distance), // CH4 Intensity hesaplama
                n2o: n2oValue, // N2O hesaplama
                n2oIntensity: calculateN2OIntensity(n2oValue, item.cargo, item.distance), // N2O Intensity hesaplama
            };
        });

        console.log("Backend Year 1 Data:", JSON.stringify(year1DataWithMetrics, null, 2));
        console.log("Backend Year 2 Data:", JSON.stringify(year2DataWithMetrics, null, 2));

        return res.json({ success: true, year1Data: year1DataWithMetrics, year2Data: year2DataWithMetrics });
    } catch (err) {
        console.error("Backend Error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch data.", error: err.message });
    }
};

const getVesselNames =  async (req, res) => {
    try {
        const vessels = await ShipsData.findAll({
            attributes: ['vessel_name'], // Sadece gemi isimlerini al
            raw: true,
        });

        const vesselNames = vessels.map(vessel => vessel.vessel_name);

        return res.json({ success: true, vesselNames });
    } catch (err) {
        console.error("Error fetching vessel names:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch vessel names." });
    }
};



const getVesselsByYear = async (req, res) => {
    try {
        const { year } = req.query;

        if (!year) {
            return res.status(400).json({ error: 'Year is required.' });
        }

        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        // Fetch data grouped by vessel
        const records = await sequelize.query(
            `SELECT cd.vessel, 
                    SUM(cd.CONS_PORT) AS totalPortConsumption,
                    SUM(cd.CONSUPTION_SEA) AS totalSeaConsumption,
                    cd.status, cd.carbon_price,
                    SUM(cd.compliance_balance) AS complianceBalance, -- Compliance balance toplama
                    fd.Cf_CO2_ggFuel, fd.Cf_CH4_gFuel, fd.Cf_N2O_gFuel, fd.LCV, fd.CO2eqWTT, fd.Cf_CO2eq_TtW
             FROM calculatedata AS cd
             JOIN fuel_data AS fd ON cd.FUEL_TYPE_SEA = fd.Pathway_Name
             WHERE cd.start >= :startDate AND cd.finish <= :endDate
             GROUP BY cd.vessel, cd.status, cd.carbon_price, fd.Cf_CO2_ggFuel, fd.Cf_CH4_gFuel, fd.Cf_N2O_gFuel, fd.LCV, fd.CO2eqWTT, fd.Cf_CO2eq_TtW`,
            {
                type: sequelize.QueryTypes.SELECT,
                replacements: { startDate, endDate },
            }
        );

        // Check if records are empty
        if (!records || records.length === 0) {
            return res.status(404).json({ error: 'No records found for the selected year.' });
        }

        const vesselData = {};

        // Process each record and group by vessel
        records.forEach(record => {
            const vessel = record.vessel;

            if (!vesselData[vessel]) {
                vesselData[vessel] = {
                    seaConsumptions: record.totalSeaConsumption || 0,
                    portConsumptions: record.totalPortConsumption || 0,
                    complianceBalance: record.complianceBalance || 0, // Compliance balance ekleme
                    ports: 0,
                    between: 0,
                    arrived: 0,
                    departed: 0,
                    totalCO2: 0,
                    ch4Ports: 0,
                    ch4Between: 0,
                    ch4Arrived: 0,
                    ch4Departed: 0,
                    n2oPorts: 0,
                    n2oBetween: 0,
                    n2oArrived: 0,
                    n2oDeparted: 0,
                    carbonPrice: record.carbon_price || 0,
                    lcv: record.LCV || 0,
                    co2eqWTT: record.CO2eqWTT || 0,
                    Cf_CO2eq_TtW: record.Cf_CO2eq_TtW || 0,
                    co2FuelFactor: record.Cf_CO2_ggFuel || 0,
                    ch4FuelFactor: record.Cf_CH4_gFuel || 0,
                    n2oFuelFactor: record.Cf_N2O_gFuel || 0,
                };
            }

            const vesselRec = vesselData[vessel];
            vesselRec.seaConsumptions += record.CONSUPTION_SEA || 0;
            vesselRec.portConsumptions += record.CONS_PORT || 0;

            // **Port Emissions**
            if (vesselRec.portConsumptions && vesselRec.co2FuelFactor) {
                const portEmission = vesselRec.portConsumptions * vesselRec.co2FuelFactor;
                vesselRec.ports += portEmission;
                vesselRec.totalCO2 += portEmission;
                vesselRec.ch4Ports += vesselRec.portConsumptions * vesselRec.ch4FuelFactor * 1000 || 0;
                vesselRec.n2oPorts += vesselRec.portConsumptions * vesselRec.n2oFuelFactor * 1000 || 0;
            }

            // **Sea Emissions**
            if (vesselRec.seaConsumptions) {
                const seaEmission = vesselRec.seaConsumptions * vesselRec.co2FuelFactor || 0;
                vesselRec.totalCO2 += seaEmission;

                switch (record.status) {
                    case 'EU/EU':
                        vesselRec.between += seaEmission;
                        vesselRec.ch4Between += (vesselRec.seaConsumptions * vesselRec.ch4FuelFactor || 0) * 1000;
                        vesselRec.n2oBetween += (vesselRec.seaConsumptions * vesselRec.n2oFuelFactor || 0) * 1000;
                        break;
                    case 'NON-EU/EU':
                    case 'EU/NON-EU':
                        vesselRec.arrived += seaEmission;
                        vesselRec.ch4Arrived += (vesselRec.seaConsumptions * vesselRec.ch4FuelFactor || 0) * 1000;
                        vesselRec.n2oArrived += (vesselRec.seaConsumptions * vesselRec.n2oFuelFactor || 0) * 1000;
                        break;
                    case 'NON-EU/NON-EU':
                        vesselRec.departed += seaEmission;
                        vesselRec.ch4Departed += (vesselRec.seaConsumptions * vesselRec.ch4FuelFactor || 0) * 1000;
                        vesselRec.n2oDeparted += (vesselRec.seaConsumptions * vesselRec.n2oFuelFactor || 0) * 1000;
                        break;
                }
            }
        });

        // Perform calculations for each vessel
        const result = Object.entries(vesselData).map(([vessel, vesselRec]) => {
            const { seaConsumptions, portConsumptions, lcv, co2eqWTT, Cf_CO2eq_TtW, carbonPrice, complianceBalance } = vesselRec;

            // TTW Calculation
            const ttw = lcv && Cf_CO2eq_TtW
                ? ((seaConsumptions * Cf_CO2eq_TtW) + (portConsumptions * Cf_CO2eq_TtW)) /
                  ((seaConsumptions * lcv) + (portConsumptions * lcv))
                : 0;

            // WTT Calculation
            const wtt = lcv && co2eqWTT
                ? ((seaConsumptions * co2eqWTT * lcv) + (portConsumptions * co2eqWTT * lcv)) /
                  ((seaConsumptions * lcv) + (portConsumptions * lcv))
                : 0;

            // GHG Calculation
            const ghg = ttw + wtt;

            // EUAs YTD Calculation
            const totalEmissions = vesselRec.arrived + vesselRec.between + vesselRec.ports;
            const EUAsYTD = carbonPrice ? (totalEmissions * 0.7) / carbonPrice : 0;
            const penalty = ghg
                ? Math.abs((89.34 - ghg) / ghg) * ((seaConsumptions * lcv) + (portConsumptions * lcv)) * (2400 / 41000)
                : 0;

            return {
                vessel,
                ...vesselRec,
                ttw: parseFloat(ttw.toFixed(2)),
                wtt: parseFloat(wtt.toFixed(2)),
                ghg: parseFloat(ghg.toFixed(2)),
                EUAsYTD: parseFloat(EUAsYTD.toFixed(2)),
                penalty: parseFloat(penalty.toFixed(2)), 
                complianceBalance: parseFloat(complianceBalance.toFixed(2)), // Compliance balance sonucu
            };
        });

        res.json({ data: result });
    } catch (error) {
        console.error('Error fetching vessel emissions:', error);
        res.status(500).json({ error: 'Failed to fetch vessel emissions.' });
    }
};

const showBarGraphPage = (req, res) => {
    res.render('admin/barGraph', { layout: 'layout/yonetim_layouts.ejs' });
};

// Gemi bazlı veri döndüren fonksiyon
const fetchGraphData = async (req, res) => {
    try {
        const metric = req.query.metric || 'emissions'; // Varsayılan metrik
        const startDate = req.query.startDate || null; // Başlangıç tarihi
        const endDate = req.query.endDate || null; // Bitiş tarihi

        const whereClause = {};

        // Tarih filtresini ekle
        if (startDate && endDate) {
            whereClause.start = { [Op.gte]: startDate }; // start >= startDate
            whereClause.finish = { [Op.lte]: endDate }; // finish <= endDate
        }

        let rows;
        if (metric === 'eua') {
            // EUA hesaplama
            rows = await CalculateData.findAll({
                attributes: [
                    'vessel',
                    [sequelize.literal('SUM(emission * 0.7 / carbon_price)'), 'total_eua']
                ],
                where: whereClause,
                group: ['vessel'],
                raw: true
            });
        } else {
            const attribute = metric === 'emissions' ? 'emission' : 'tax';
            rows = await CalculateData.findAll({
                attributes: [
                    'vessel',
                    [sequelize.fn('SUM', sequelize.col(attribute)), 'total_value']
                ],
                where: whereClause,
                group: ['vessel'],
                raw: true
            });
        }

        const categories = rows.map(row => row.vessel); // Gemi isimleri
        const values = rows.map(row => row.total_eua || row.total_value); // Değerler

        res.json({ categories, values });
    } catch (error) {
        console.error("Grafik verisi alınırken hata oluştu:", error);
        res.status(500).send("Grafik verisi alınamadı.");
    }
};


const fetchTaxAndEuaData = async (req, res) => {
    try {
        const action = req.query.action || 'data'; // "data" veya "vessels"
        const startDate = req.query.startDate || null;
        const endDate = req.query.endDate || null;
        const vessel = req.query.vessel || null;

        if (action === 'vessels') {
            // Gemi listesini döndür
            const vessels = await CalculateData.findAll({
                attributes: [[literal('DISTINCT vessel'), 'vessel']], // Benzersiz gemileri getir
                raw: true
            });

            const vesselList = vessels.map(row => row.vessel);
            return res.json({ vesselList });
        }

        // Grafik verisi için sorgu
        const whereClause = {};

        // Tarih filtresi ekle
        if (startDate && endDate) {
            whereClause.start = { [Op.gte]: startDate };
            whereClause.finish = { [Op.lte]: endDate };
        }

        // Gemi filtresi ekle
        if (vessel) {
            whereClause.vessel = vessel;
        }

        // EUA ve Vergi verilerini hesapla
        const rows = await CalculateData.findAll({
            attributes: [
                [literal("DATE_FORMAT(start, '%Y-%m')"), 'month'], // Ay ve yıl gruplandırması
                [literal('SUM(emission * 0.7 / carbon_price)'), 'eua_price'], // EUA hesaplama
                [literal('SUM(tax)'), 'total_tax'] // Vergi hesaplama
            ],
            where: whereClause,
            group: ['month'],
            raw: true
        });

        // Veriyi ayır
        const months = rows.map(row => row.month); // Aylar
        const euaPrices = rows.map(row => row.eua_price); // EUA fiyatları
        const taxes = rows.map(row => row.total_tax); // Vergiler

        res.json({ months, euaPrices, taxes });
    } catch (error) {
        console.error("Grafik verisi alınırken hata oluştu:", error);
        res.status(500).send("Veriler alınamadı.");
    }
};
const renderTaxAndEuaGraphPage = (req, res) => {
    res.render('admin/taxAndEuaGraph',{ layout: 'layout/yonetim_layouts.ejs' }); // EJS dosyasını render eder
};








module.exports = { 
    mainpageshow,
    uploadAndProcessExcel,
    dashboardpage,
    fuelboard,
    getChartData,
    getFuelChartData,
    renderFuelPage,
    getFuelConsumptionData,
    ukpageshow,
    indicatorpageshow,
    getCO2ChartData,
    getVesselVoyagesByDate,
    getVesselNames,
    getVesselsByYear,
    showBarGraphPage, 
    fetchGraphData,
    fetchTaxAndEuaData,
    renderTaxAndEuaGraphPage
}
