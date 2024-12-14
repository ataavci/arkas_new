
async function fetchMobileConsumptionData() {
  try {
      const response = await fetch('/office/mobile-consumption'); // Backend API endpoint
      const result = await response.json();

      if (response.ok) {
          const { categories, values } = result;

          // Gelen verileri grafiğe aktar
          updateMobileConsumptionChart(categories, values);
      } else {
          console.error("API Error:", result.message);
      }
  } catch (error) {
      console.error("Fetch Error:", error);
  }
}

// ApexCharts grafiğini güncelle
function updateMobileConsumptionChart(categories, values) {
  const options = {
      series: [{
          data: values, // API'den gelen değerler
      }],
      chart: {
          type: 'bar',
          height: 380
      },
      plotOptions: {
          bar: {
              barHeight: '100%',
              distributed: true,
              horizontal: true,
              dataLabels: {
                  position: 'bottom'
              },
          }
      },
      colors: ['#33b2df', '#546E7A', '#d4526e', '#13d8aa', '#A5978B', '#2b908f', '#f9a3a4', '#90ee7e',
          '#f48024', '#69d2e7'
      ],
      dataLabels: {
          enabled: true,
          textAnchor: 'start',
          style: {
              colors: ['#fff']
          },
          formatter: function (val, opt) {
              return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val.toFixed(2);
          },
          offsetX: 0,
          dropShadow: {
              enabled: true
          }
      },
      stroke: {
          width: 1,
          colors: ['#fff']
      },
      xaxis: {
          categories: categories, // API'den gelen kategoriler
      },
      yaxis: {
          labels: {
              show: false
          }
      },
      title: {
          text: 'Mobile Consumption Breakdown',
          align: 'center',
          floating: true
      },
      subtitle: {
          text: 'Category Names as DataLabels inside bars',
          align: 'center',
      },
      tooltip: {
          theme: 'dark',
          x: {
              show: false
          },
          y: {
              title: {
                  formatter: function () {
                      return '';
                  }
              }
          }
      }
  };

  const chart = new ApexCharts(document.querySelector("#mobile_cons"), options);
  chart.render();
}

// API'den verileri çek ve grafiği güncelle
fetchMobileConsumptionData();
