const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item=> {
	const li = item.parentElement;

	item.addEventListener('click', function () {
		allSideMenu.forEach(i=> {
			i.parentElement.classList.remove('active');
		})
		li.classList.add('active');
	})
});




// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})







const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})





if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})



const switchMode = document.getElementById('switch-mode');

switchMode.addEventListener('change', function () {
	if(this.checked) {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
})

function calculateOffset() {
    const water = parseFloat(document.getElementById('custom-water').value); // Su miktarını alıyoruz, parseFloat ile sayıya dönüştürüyoruz
    const electric = parseFloat(document.getElementById('custom-electric').value); // Mesafe bilgisini alıyoruz
    const gas = parseFloat(document.getElementById('custom-gas').value); // Emisyon faktörünü alıyoruz

    // Offset miktarını hesaplıyoruz (örnek bir hesaplama)
    const offsetQuantity = (water*0.4)+(electric*0.49) +(0.18*gas);

    // Sonucu HTML'e yazdırıyoruz
    document.getElementById('offsetResult').textContent = `Offset Quantity: ${offsetQuantity.toFixed(2)} tons CO₂`;

    // Bootstrap modalı gösteriyoruz
    var myModal = new bootstrap.Modal(document.getElementById('resultModal'));
    myModal.show();
}
document.addEventListener('DOMContentLoaded', () => {
    fetch('/admins/admin')
        .then(response => response.json())
        .then(data => {
            const officeTableBody = document.getElementById('office-emission-table');
            const totalTableBody = document.getElementById('total-emission-table');

            // Office Emissions Table
            data.forEach(emission => {
                const row = `
                    <tr>
                        <td>Electricity Consumption</td>
                        <td>${emission.electricity_consumption}</td>
                        <td>S2</td>
                    </tr>
                    <tr>
                        <td>Water Consumption</td>
                        <td>${emission.water_consumption}</td>
                        <td>S3</td>
                    </tr>
                    <tr>
                        <td>Bottled Water Consumption</td>
                        <td>${emission.bottled_water_consumption}</td>
                        <td>S3</td>
                    </tr>
                    <tr>
                        <td>Mobile Combustion</td>
                        <td>${emission.mobile_combustion}</td>
                        <td>S1</td>
                    </tr>
                    <!-- Diğer Office Emission Verileri -->
                `;
                officeTableBody.innerHTML += row;
            });

            // Total Office Emission
            const totalRow = `
                <tr>
                    <td>Total Commuting</td>
                    <td>${data[0].total_commuting} kg CO2e</td>
                </tr>
                <tr>
                    <td>Total Office Emission (kg)</td>
                    <td>${data[0].total_office_emission_kg} kg CO2e</td>
                </tr>
                <tr>
                    <td>Total Office Emission (ton)</td>
                    <td>${data[0].total_office_emission_ton} ton CO2e</td>
                </tr>
            `;
            totalTableBody.innerHTML += totalRow;
        })
        .catch(error => console.error('Error fetching data:', error));
});



