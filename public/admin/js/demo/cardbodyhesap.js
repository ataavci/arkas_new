async function fetchTotalEmission() {
    try {
        const response = await fetch('/office/total-emission');
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        const data = await response.json();
        const totalEmissionElement = document.querySelector('.h5.mb-0.font-weight-bold.text-gray-800');
        totalEmissionElement.textContent = data.totalEmission.toFixed(2); // Toplam değeri güncelle
    } catch (error) {
        console.error("Toplam emisyon alınırken hata oluştu:", error);
    }
}

async function fetchOffsetCarbon() {
    try {
        const response = await fetch('/office/offset-carbon');
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        const data = await response.json();
        console.log("Offset Carbon API Response:", data);

        const offsetCarbonElement = document.querySelector('.offset-co2 .h5.mb-0.font-weight-bold.text-gray-800');
        if (offsetCarbonElement) {
            offsetCarbonElement.textContent = data.offsetCarbon.toFixed(2); // Offset CO2 değerini güncelle
            console.log("Offset Carbon değeri güncellendi:", data.offsetCarbon);
        } else {
            console.error("Offset Carbon Element Bulunamadı!");
        }
    } catch (error) {
        console.error("Offset CO2 alınırken hata oluştu:", error);
    }
}

async function fetchOffsetPercentage() {
    try {
        const response = await fetch('/office/offset-percentage'); // Backend API endpoint
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        const data = await response.json();
        console.log("Offset Percentage API Response:", data);

        // Offset yüzdesini güncelle
        const offsetPercentageElement = document.querySelector('.offset-percentage .h5.mb-0.font-weight-bold.text-gray-800');
        if (offsetPercentageElement) {
            offsetPercentageElement.textContent = `${data.offsetPercentage}%`; // Yüzdelik değeri ekle
        } else {
            console.error("Offset Percentage Element Bulunamadı!");
        }
    } catch (error) {
        console.error("Offset yüzdesi alınırken hata oluştu:", error);
    }
}
async function fetchRemainingCarbon() {
    try {
        const response = await fetch('/office/remaining-carbon'); // Backend API endpoint
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        const data = await response.json();
        console.log("Remaining Carbon API Response:", data);

        // Kalan karbonu güncelle
        const remainingCarbonElement = document.querySelector('.text-warning .h5.mb-0.font-weight-bold.text-gray-800');
        if (remainingCarbonElement) {
            remainingCarbonElement.textContent = data.remainingCarbon; // Kalan karbon değerini ekle
        } else {
            console.error("Remaining Carbon Element Bulunamadı!");
        }
    } catch (error) {
        console.error("Kalan karbon alınırken hata oluştu:", error);
    }
}

// Sayfa yüklendiğinde tüm değerleri getir
window.onload = async function () {
    await fetchTotalEmission();
    await fetchOffsetCarbon();
    await fetchOffsetPercentage();
    await fetchRemainingCarbon(); // Kalan karbonu getir
};