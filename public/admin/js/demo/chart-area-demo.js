async function fetchMonthlyEmissions() {
  try {
      const response = await fetch('/office/monthly-emissions');
      const result = await response.json();

      if (response.ok) {
          const data = result.data; // API'den gelen veriler
          updateAreaChart(data); // Grafiği güncelle
      } else {
          console.error("API Error:", result.message);
      }
  } catch (error) {
      console.error("Fetch Error:", error);
  }
}

// Area Chart'i Güncelle
function updateAreaChart(data) {
  const ctx = document.getElementById("myAreaChart").getContext("2d");
  const myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [{
              label: "Emissions (tons)",
              lineTension: 0.3,
              backgroundColor: "rgba(78, 115, 223, 0.05)",
              borderColor: "rgba(78, 115, 223, 1)",
              pointRadius: 3,
              pointBackgroundColor: "rgba(78, 115, 223, 1)",
              pointBorderColor: "rgba(78, 115, 223, 1)",
              pointHoverRadius: 3,
              pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
              pointHoverBorderColor: "rgba(78, 115, 223, 1)",
              pointHitRadius: 10,
              pointBorderWidth: 2,
              data: data, // API'den gelen aylık emisyon verileri
          }],
      },
      options: {
          maintainAspectRatio: false,
          layout: {
              padding: {
                  left: 10,
                  right: 25,
                  top: 25,
                  bottom: 0
              }
          },
          scales: {
              xAxes: [{
                  time: {
                      unit: 'date'
                  },
                  gridLines: {
                      display: false,
                      drawBorder: false
                  },
                  ticks: {
                      maxTicksLimit: 12
                  }
              }],
              yAxes: [{
                  ticks: {
                      maxTicksLimit: 5,
                      padding: 10,
                      callback: function(value, index, values) {
                          return value + " tons";
                      }
                  },
                  gridLines: {
                      color: "rgb(234, 236, 244)",
                      zeroLineColor: "rgb(234, 236, 244)",
                      drawBorder: false,
                      borderDash: [2],
                      zeroLineBorderDash: [2]
                  }
              }],
          },
          legend: {
              display: false
          },
          tooltips: {
              backgroundColor: "rgb(255,255,255)",
              bodyFontColor: "#858796",
              titleMarginBottom: 10,
              titleFontColor: '#6e707e',
              titleFontSize: 14,
              borderColor: '#dddfeb',
              borderWidth: 1,
              xPadding: 15,
              yPadding: 15,
              displayColors: false,
              intersect: false,
              mode: 'index',
              caretPadding: 10,
              callbacks: {
                  label: function(tooltipItem, chart) {
                      var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                      return datasetLabel + ': ' + tooltipItem.yLabel + " tons";
                  }
              }
          }
      }
  });
}

// API'yi çağır ve grafiği güncelle
fetchMonthlyEmissions();