

const simulation = require("../modals/simulation");
const portdata = require("../modals/portdata");
const vessel_data = require("../modals/vessel_data");
const FuelData = require("../modals/fueldata"); // fueldata modelini FuelData olarak değiştirdik

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
    });

    console.log("8. Yeni kayıt oluşturuldu:", JSON.stringify(newSimulation, null, 2));

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






