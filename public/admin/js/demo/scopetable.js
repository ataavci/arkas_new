async function fetchAndRenderTable() {
    try {
        const response = await fetch('/office/scope-data'); // API endpoint
        if (!response.ok) {
            throw new Error("Error fetching data from API");
        }
        const data = await response.json();

        // Reference to the table body
        const tableBody = document.querySelector('table tbody');

        // Clear existing table content
        tableBody.innerHTML = '';

        // Scope 1
        const scope1Rows = [
            { name: 'Stationary Combustion', values: data.Scope1.StationaryCombustion },
            { name: 'Mobile Combustion', values: data.Scope1.MobileCombustion },
            { name: 'Fugitive Emissions from Air-conditioning', values: data.Scope1.FugitiveEmissions },
        ];

        addScopeRows('Scope 1', scope1Rows, tableBody);

        // Scope 2
        const scope2Rows = [
            { name: 'Purchased Electricity', values: data.Scope2.PurchasedElectricity },
            { name: 'Purchased Heat and Steam', values: data.Scope2.PurchasedHeatSteam },
        ];

        addScopeRows('Scope 2', scope2Rows, tableBody);

        // Scope 3
        const scope3Rows = [
            { name: 'Purchased Goods and Services', values: data.Scope3.PurchasedGoods },
            { name: 'Waste Generated in Operations', values: data.Scope3.WasteGenerated },
            { name: 'Air', values: data.Scope3.Air },
            { name: 'Other Travel Modes', values: data.Scope3.OtherTravelModes },
            { name: 'Employee Commuting', values: data.Scope3.EmployeeCommuting },
        ];

        addScopeRows('Scope 3', scope3Rows, tableBody);
    } catch (error) {
        console.error('Error fetching table data:', error);
    }
}

function addScopeRows(scopeName, rows, tableBody) {
    // Add scope header row
    const scopeRow = document.createElement('tr');
    scopeRow.classList.add('category');
    scopeRow.innerHTML = `<td>${scopeName}</td><td></td>${'<td></td>'.repeat(12)}<td></td>`;
    tableBody.appendChild(scopeRow);

    // Add data rows for each scope
    rows.forEach(row => {
        const dataRow = document.createElement('tr');
        const total = row.values.reduce((acc, val) => acc + (val || 0), 0); // Calculate total
        const monthlyData = row.values.map(val => `<td>${val !== null ? val.toFixed(2) : ''}</td>`).join('');

        dataRow.innerHTML = `
            <td></td>
            <td>${row.name}</td>
            ${monthlyData}
            <td>${total.toFixed(2)}</td>
        `;
        tableBody.appendChild(dataRow);
    });

    // Add scope total row
    const totalRow = document.createElement('tr');
    totalRow.classList.add('total');
    const scopeTotal = rows.reduce(
        (acc, row) => acc + row.values.reduce((sum, val) => sum + (val || 0), 0),
        0
    );

    totalRow.innerHTML = `
        <td colspan="14" class="total">${scopeName} Total</td>
        <td>${scopeTotal.toFixed(2)}</td>
    `;
    tableBody.appendChild(totalRow);
}

// Initialize table rendering
document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderTable();
});
