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
        const response = await fetch('/office/offset-percentage');
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        const data = await response.json();
        console.log("Offset Percentage API Response:", data);

        // Offset yüzdesini güncelle
        const offsetPercentageElement = document.querySelector('.offset-percentage .h5.mb-0.mr-3.font-weight-bold.text-gray-800');
        const progressBarElement = document.querySelector('.progress-bar.bg-info');

        if (offsetPercentageElement && progressBarElement) {
            offsetPercentageElement.textContent = `${data.percentage.toFixed(2)}%`; // Yüzde değeri ekle
            progressBarElement.style.width = `${data.percentage}%`; // Bar genişliğini güncelle
            progressBarElement.setAttribute('aria-valuenow', data.percentage); // Aria değerini güncelle
        } else {
            console.error("Offset Percentage Element veya Progress Bar Bulunamadı!");
        }
    } catch (error) {
        console.error("Offset yüzdesi alınırken hata oluştu:", error);
    }
}

async function fetchRemainingCarbon() {
    try {
        // Fetch data from the API
        const response = await fetch('/office/remaining-carbon'); // Correct endpoint
        if (!response.ok) {
            throw new Error("API'den veri alınırken hata oluştu");
        }

        // Parse the JSON data
        const data = await response.json();
        console.log("Remaining Carbon API Response:", data);

        // Select the target element
        const remainingCarbonElement = document.querySelector('.card.border-left-warning .h5.mb-0.font-weight-bold.text-gray-800');
        
        if (remainingCarbonElement) {
            // Update the element with the fetched value
            remainingCarbonElement.textContent = parseFloat(data.remainingCarbon).toFixed(2); // Format the value
        } else {
            console.error("Remaining Carbon Element Bulunamadı!");
        }
    } catch (error) {
        console.error("Remaining Carbon alınırken hata oluştu:", error);
    }
}

// Ensure the function runs on page load
window.onload = async function () {
    await fetchTotalEmission();
    await fetchOffsetCarbon();
    await fetchOffsetPercentage();
    await fetchRemainingCarbon(); // Fetch remaining carbon
};
