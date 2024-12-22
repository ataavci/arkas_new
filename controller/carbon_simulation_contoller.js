const simulation = require("../models/simulation");
const portdata = require("../models/portdata");
const vessel_data = require("../models/vessel_data");
const FuelData = require("../models/fueldata"); // FuelData model
const SimulationSummary = require("../models/simulation_summary");
const { Op } = require("sequelize");

const simulate = async (req, res) => {
  try {
    console.log("Gelen Body Verisi:", JSON.stringify(req.body, null, 2));

    const {
      expedition,
      vessel_name,
      from_port,
      to_port,
      departure,
      speed,
      distance,
      distance_eca,
      port_day,
      daily_consumption_at_sea,
      daily_consumption_at_port,
      sea_fuel_pathway,
      eca_fuel_pathway,
      port_fuel_pathway,
    } = req.body;

    if (
      !expedition || !vessel_name || !from_port || !to_port || !departure ||
      speed == null || distance == null || distance_eca == null || port_day == null ||
      daily_consumption_at_sea == null || daily_consumption_at_port == null ||
      !sea_fuel_pathway || !eca_fuel_pathway || !port_fuel_pathway
    ) {
      console.log("Eksik veya geçersiz parametreler:", req.body);
      return res.status(400).json({
        error: "Tüm alanlar zorunludur ve boş bırakılamaz",
      });
    }
    
    console.log("1. Gelen veriler (parsed):", req.body);

    const fromportdata = await portdata.findOne({ where: { port: from_port } });
    const toportdata = await portdata.findOne({ where: { port: to_port } });

    if (!fromportdata || !toportdata) {
      console.log("2. Limanlardan biri bulunamadı:", { fromportdata, toportdata });
      return res.status(404).json({ error: "Belirtilen limanlardan biri bulunamadı" });
    }

    const Status = `${fromportdata.status}/${toportdata.status}`;
    console.log("3. Status:", Status);

    const vesselData = await vessel_data.findOne({ where: { vessel_name } });
    if (!vesselData) {
      console.log("4. Gemi bulunamadı:", { vessel_name });
      return res.status(404).json({ error: "Belirtilen gemi bulunamadı" });
    }

    const seaFuelData = await FuelData.findOne({ where: { Pathway_Name: sea_fuel_pathway } });
    const ecaFuelData = await FuelData.findOne({ where: { Pathway_Name: eca_fuel_pathway } });
    const portFuelData = await FuelData.findOne({ where: { Pathway_Name: port_fuel_pathway } });

    if (!seaFuelData || !ecaFuelData || !portFuelData) {
      console.log("5. Yakıt verisi bulunamadı:", {
        seaFuelData,
        ecaFuelData,
        portFuelData,
      });
      return res.status(404).json({ error: "Belirtilen yakıt verilerinden biri bulunamadı" });
    }

    const day_of_sea = (distance /( 24*speed)) + (distance_eca /( 24*speed));
    console.log("6. Denizde geçen süre (gün):", day_of_sea);

    const departureDate = new Date(departure);
if (isNaN(departureDate)) {
  return res.status(400).json({ error: "Geçersiz tarih formatı: departure" });
}

    const totalDays = day_of_sea + port_day;
    const arrivelDate = new Date(departureDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    console.log("7. Seferin bitiş tarihi (arrivel):", arrivelDate);

    const sea_consumption = daily_consumption_at_sea *(distance /( 24*speed)) ;
    const eca_consumption = daily_consumption_at_sea * (distance_eca /( 24*speed));
    
    const port_consumption = daily_consumption_at_port * port_day;

    console.log("8. Sea Consumption:", sea_consumption);
    console.log("9. ECA Consumption:", eca_consumption);
    console.log("10. Port Consumption:", port_consumption);

    // Status durumuna göre sea_consumption işlemleri
    let consumption_100_sea = 0;
    let consumption_50_sea = 0;
    let zeroSeaConsumption = 0;

    if (Status === "EU/EU") {
      consumption_100_sea = sea_consumption; // Tam olarak kullanılır
    } else if (Status === "EU/NON-EU" || Status === "NON-EU/EU") {
      consumption_50_sea = sea_consumption * 0.5; // %50 kullanılır
    } else if (Status === "NON-EU/NON-EU") {
      zeroSeaConsumption = sea_consumption * 0; // Hiç kullanılmaz
    }

    console.log("11. EU/EU Sea Consumption:", consumption_100_sea);
    console.log("12. EU/NON-EU or NON-EU/EU Sea Consumption:", consumption_50_sea);
    console.log("13. NON-EU/NON-EU Zero Consumption:", zeroSeaConsumption);
    let consumption_100_eca = 0;
    let consumption_50_eca = 0;
    let zeroEcaConsumption = 0;

    if (Status === "EU/EU") {
      consumption_100_eca = eca_consumption; // Tam olarak kullanılır
    } else if (Status === "EU/NON-EU" || Status === "NON-EU/EU") {
      consumption_50_eca = eca_consumption * 0.5; // %50 kullanılır
    } else if (Status === "NON-EU/NON-EU") {
      zeroEcaConsumption = eca_consumption * 0; // Hiç kullanılmaz
    }
    console.log("11. EU/EU Sea Consumption:", consumption_100_eca);
    console.log("12. EU/NON-EU or NON-EU/EU Sea Consumption:", consumption_50_eca);
    console.log("13. NON-EU/NON-EU Zero Consumption:", zeroEcaConsumption);

    let consumption_100_port = 0;
    let consumption_0_port = 0;

    if (toportdata.status === "EU") {
      consumption_100_port = port_consumption; // Eğer to_port "EU" ise tam kaydedilir
    } else {
      consumption_0_port = port_consumption; // Eğer to_port "NON-EU" ise sıfır olarak kaydedilir
    }

    console.log("11. Consumption 100% Port:", consumption_100_port);
    console.log("12. Consumption 0% Port:", consumption_0_port);
    const Cf_CO2_ggFuel_1 = seaFuelData.Cf_CO2_ggFuel; // Yakıtın CO2 eşdeğeri
    const ets_1 = (consumption_100_sea + consumption_50_sea) * Cf_CO2_ggFuel_1;
    const Cf_CO2_ggFuel_2 = ecaFuelData.Cf_CO2_ggFuel; // Yakıtın CO2 eşdeğeri
    const ets_2 = (consumption_100_eca + consumption_50_eca) * Cf_CO2_ggFuel_2;
    const Cf_CO2_ggFuel_3 = portFuelData.Cf_CO2_ggFuel; // Yakıtın CO2 eşdeğeri
    const ets_3 = (consumption_100_port) * Cf_CO2_ggFuel_3;
    const ets=ets_1+ets_2+ets_3

    const Cf_CO2eq_TtW_sea = seaFuelData.Cf_CO2eq_TtW;
    const Cf_CO2eq_TtW_eca = ecaFuelData.Cf_CO2eq_TtW;
    const Cf_CO2eq_TtW_port = portFuelData.Cf_CO2eq_TtW;

    const lcv_sea = seaFuelData.LCV;
    const lcv_eca = ecaFuelData.LCV;
    const lcv_port = portFuelData.LCV;

    const CO2eqWTT_sea = seaFuelData.CO2eqWTT;
    const CO2eqWTT_eca = ecaFuelData.CO2eqWTT;
    const CO2eqWTT_port = portFuelData.CO2eqWTT;



    console.log("16. ETS Hesaplanan Değer:", ets);
    

    const target_ghg=89.34
    const TTW=((consumption_100_sea+consumption_50_sea)*Cf_CO2eq_TtW_sea+(consumption_100_eca+consumption_50_eca)*Cf_CO2eq_TtW_eca+consumption_100_port*Cf_CO2eq_TtW_port)/((consumption_100_sea+consumption_50_sea)*lcv_sea+(consumption_100_eca+consumption_50_eca)*lcv_eca+consumption_100_port*lcv_port);
    const WTT=((consumption_100_sea+consumption_50_sea)*CO2eqWTT_sea*lcv_sea+(consumption_100_eca+consumption_50_eca)*CO2eqWTT_eca*lcv_eca+consumption_100_port*CO2eqWTT_port*lcv_port)/((consumption_100_sea+consumption_50_sea)*lcv_sea+(consumption_100_eca+consumption_50_eca)*lcv_eca+consumption_100_port*lcv_port);
    const GHG_ACTUAL=WTT+TTW
    const COMPLIANCE_BALANCE=(target_ghg-GHG_ACTUAL)*((consumption_100_sea+consumption_50_sea)*lcv_sea+(consumption_100_eca+consumption_50_eca)*lcv_eca+consumption_100_port*lcv_port)*1000000
    const Fuel_Consumption_Total=(consumption_100_sea+consumption_50_sea+consumption_100_eca+consumption_50_eca+consumption_100_port);

    let fuel_eu;

if (GHG_ACTUAL > target_ghg) {
  fuel_eu = (Math.abs(COMPLIANCE_BALANCE) / (GHG_ACTUAL * 41000)) * 2400;
} else {
  fuel_eu = 0;
}



    const newSimulation = await simulation.create({
      user_id: 1,
      expedition,
      vessel_name,
      dwt: vesselData.dwt,
      from_port,
      to_port,
      status: Status,
      departure: departureDate,
      arrivel: arrivelDate,
      distance,
      distance_eca,
      port_day,
      speed,
      day_of_sea,
      daily_consumption_at_sea,
      daily_consumption_at_port,
      sea_fuel: seaFuelData.Pathway_Name,
      eca_fuel: ecaFuelData.Pathway_Name,
      port_fuel: portFuelData.Pathway_Name,
      sea_consumption,
      eca_consumption,
      port_consumption,
      consumption_100_sea,
      consumption_50_sea,
      zeroSeaConsumption,
      consumption_100_eca,
      consumption_50_eca,
      zeroEcaConsumption,
      consumption_100_port,
      consumption_0_port,
      ets,
      TTW,
      WTT,
      GHG_ACTUAL,
      COMPLIANCE_BALANCE,
      Fuel_Consumption_Total,
      fuel_eu

      
    });

    console.log("14. Yeni kayıt oluşturuldu:", JSON.stringify(newSimulation, null, 2));

    return res.status(201).json({
      message: "Simulation başarıyla kaydedildi",
      data: newSimulation,
    });
  } catch (error) {
    console.error("Bir hata oluştu:", error.message);
    return res.status(500).json({ error: "Bir hata oluştu, lütfen tekrar deneyin" });
  }
};
const calculateRouteSummary = async (req, res) => {
  try {
    const { expedition, year } = req.query;

    if (!expedition || !year) {
      return res.status(400).json({ error: "Expedition ve year parametreleri zorunludur." });
    }

    const simulations = await simulation.findAll({
      where: {
        expedition,
        departure: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`),
        },
      },
    });

    if (!simulations || simulations.length === 0) {
      return res.status(404).json({ error: "Belirtilen sefer veya yıl için kayıt bulunamadı." });
    }

    // Verileri toplama
    const totalPortDay = simulations.reduce((sum, row) => sum + row.port_day, 0);
    const totalDayOfSea = simulations.reduce((sum, row) => {
      const departureDate = new Date(row.departure);
      const arrivelDate = new Date(row.arrivel);
      const daysForThisSimulation = (arrivelDate - departureDate) / (1000 * 60 * 60 * 24);
      return sum + daysForThisSimulation - row.port_day;
    }, 0);

    const totalDays = totalPortDay + totalDayOfSea;
    const totalEts = simulations.reduce((sum, row) => sum + row.ets, 0);
    const totalComplianceBalance = simulations.reduce((sum, row) => sum + row.COMPLIANCE_BALANCE, 0);
    const totalFuelEu = simulations.reduce((sum, row) => sum + row.fuel_eu, 0);

    const totalDaysInYear = simulations.reduce((sum, row) => {
      const departureDate = new Date(row.departure);
      const arrivelDate = new Date(row.arrivel);
      const daysForThisSimulation = (arrivelDate - departureDate) / (1000 * 60 * 60 * 24);
      return sum + daysForThisSimulation;
    }, 0);

    const timesPerYear = Math.round(365 / (totalDaysInYear / simulations.length));

    const toPortStatuses = simulations.map((row) => ({
      to_port: row.to_port,
      port_day: row.port_day,
      status: row.arrivel ? "Limanda" : "Seyirde",
    }));

    const newSummary = await SimulationSummary.create({
      expedition,
      total_port_day: totalPortDay,
      total_day_of_sea: totalDayOfSea,
      total_days: totalDays,
      total_ets: totalEts,
      total_compliance_balance: totalComplianceBalance,
      total_fuel_eu: totalFuelEu,
      times_per_year: timesPerYear,
      to_port_status: JSON.stringify(toPortStatuses),
    });

    res.status(201).json({
      message: "Sefer özeti başarıyla oluşturuldu.",
      data: newSummary,
    });
  } catch (error) {
    console.error("Rotaya göre özet oluşturulurken hata:", error.message);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
  }
};

module.exports = { simulate ,calculateRouteSummary};
