// API'den Scope verilerini çek
async function fetchScopeData() {
  try {
      // Backend'deki API'yi çağır
      const response = await fetch('/office/scope-emissions');
      const result = await response.json();

      if (response.ok) {
          // API'den gelen Scope verilerini al
          const { scope1, scope2, scope3 } = result.data;

          // Verileri grafiğe gönder
          updatePieChart([parseFloat(scope1), parseFloat(scope2), parseFloat(scope3)]);
      } else {
          console.error("API Error:", result.message);
      }
  } catch (error) {
      console.error("Fetch Error:", error);
  }
}

// Pie Chart'i Güncelle
function updatePieChart(data) {
  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
          labels: ["Scope 1", "Scope 2", "Scope 3"],
          datasets: [{
              data: data,
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
              hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
              hoverBorderColor: "rgba(234, 236, 244, 1)",
          }],
      },
      options: {
          maintainAspectRatio: false,
          tooltips: {
              backgroundColor: "rgb(255,255,255)",
              bodyFontColor: "#858796",
              borderColor: '#dddfeb',
              borderWidth: 1,
              xPadding: 15,
              yPadding: 15,
              displayColors: false,
              caretPadding: 10,
          },
          legend: {
              display: false
          },
          cutoutPercentage: 80,
      },
  });
}

// API'den verileri çek ve Pie Chart'i güncelle
fetchScopeData();
