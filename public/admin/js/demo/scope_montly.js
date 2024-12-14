async function fetchMonthlyScopesData() {
    try {
        const response = await fetch('/office/monthly-scopes');
        const data = await response.json();

        if (response.ok) {
            const months = data.map(item => item.month); // Ay isimleri
            const scope1Data = data.map(item => parseFloat(item.scope1.toFixed(2))); // Scope 1 verileri
            const scope2Data = data.map(item => parseFloat(item.scope2.toFixed(2))); // Scope 2 verileri
            const scope3Data = data.map(item => parseFloat(item.scope3.toFixed(2))); // Scope 3 verileri

            updateScopesChart(months, scope1Data, scope2Data, scope3Data);
        } else {
            console.error("API Error:", data.message);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

function updateScopesChart(months, scope1Data, scope2Data, scope3Data) {
    const options = {
        series: [
            { name: "Scope 1", data: scope1Data },
            { name: "Scope 2", data: scope2Data },
            { name: "Scope 3", data: scope3Data }
        ],
        chart: {
            type: 'bar',
            height: 430,
        },
        plotOptions: {
            bar: {
                horizontal: false,
                dataLabels: {
                    position: 'top',
                },
            },
        },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(2); // Virgülden sonra iki basamak
            },
            style: {
                fontSize: '12px',
                colors: ['#fff'],
            },
        },
        xaxis: {
            categories: months, // Ay isimleri burada
        },
        legend: {
            position: 'top',
        },
        tooltip: {
            shared: true,
            intersect: false,
        },
        colors: ['#4e73df', '#1cc88a', '#36b9cc'], // Scope 1, 2 ve 3 için renkler
    };

    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}

// API'den verileri çek ve grafiği güncelle
fetchMonthlyScopesData();
