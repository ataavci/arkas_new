const simulation = require("../modals/simulation");
const portdata = require("../modals/portdata");
const vessel_data = require("../modals/vessel_data");
const FuelData = require("../modals/fueldata"); // FuelData model



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
      !speed || !distance || !distance_eca || port_day === undefined ||
      daily_consumption_at_sea === undefined || daily_consumption_at_port === undefined ||
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

    const day_of_sea = (distance / speed) + (distance_eca / speed);
    console.log("6. Denizde geçen süre (gün):", day_of_sea);

    const departureDate = new Date(departure);
    const totalDays = day_of_sea + port_day;
    const arrivelDate = new Date(departureDate.getTime() + totalDays * 24 * 60 * 60 * 1000);
    console.log("7. Seferin bitiş tarihi (arrivel):", arrivelDate);

    const sea_consumption = daily_consumption_at_sea *(distance / speed) ;
    const eca_consumption = daily_consumption_at_sea * (distance_eca / speed);
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



module.exports = { simulate };
