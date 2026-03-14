import { SalesData } from "../data/salesdata.js";

const tbody = document.getElementById("salesBody");
const monthPicker = document.getElementById("monthPicker");

// Format numbers with comma and .00
function formatNumber(num) {
    return Number(num || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Load month data
function loadMonth() {
    tbody.innerHTML = "";

    const selected = monthPicker.value;
    const date = new Date(selected + "-01");
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const monthData = SalesData[selected] || {};

    let totalParkingCash = 0;
    let totalETagCash = 0;
    let totalParkingBank = 0;
    let totalETagBank = 0;
    let totalSales = 0;
    let totalExpenses = 0;
    let totalDeposit = 0;
    let totalAccount = 0;

    for (let i = 1; i <= days; i++) {

        const d = monthData[i] || {
            desc: "Sales",
            parkingCash: 0,
            etagCash: 0,
            parkingBank: 0,
            etagBank: 0,
            expenses: 0,
            deposit: 0,
            account: 0
        };

        const rowParking = (d.parkingCash || 0) + (d.parkingBank || 0);
        const rowETag = (d.etagCash || 0) + (d.etagBank || 0);
        const total = rowParking + rowETag;
        const balance = 0; // placeholder

        // accumulate totals
        totalParkingCash += d.parkingCash || 0;
        totalETagCash += d.etagCash || 0;
        totalParkingBank += d.parkingBank || 0;
        totalETagBank += d.etagBank || 0;
        totalSales += total;
        totalExpenses += d.expenses || 0;
        totalDeposit += d.deposit || 0;
        totalAccount += d.account || 0;

        tbody.innerHTML += `
<tr>
<td>${String(i).padStart(2, "0")}</td>
<td>${d.desc}</td>
<td>${formatNumber(d.parkingCash)}</td>
<td>${formatNumber(d.etagCash)}</td>
<td>${formatNumber(d.parkingBank)}</td>
<td>${formatNumber(d.etagBank)}</td>
<td class="salesTotal">${formatNumber(total)}</td>
<td>${formatNumber(d.expenses)}</td>
<td>${formatNumber(d.deposit)}</td>
<td>${formatNumber(d.account)}</td>
<td class="balance">${formatNumber(balance)}</td>
</tr>`;
    }

    calculateTotals(
        totalParkingCash,
        totalETagCash,
        totalParkingBank,
        totalETagBank,
        totalSales,
        totalExpenses,
        totalDeposit,
        totalAccount
    );
}


// Calculate totals
function calculateTotals(
    parkingCash,
    etagCash,
    parkingBank,
    etagBank,
    sales,
    expenses,
    deposit,
    account
) {

    document.getElementById("tParkingCash").innerText = formatNumber(parkingCash);
    document.getElementById("tETagCash").innerText = formatNumber(etagCash);
    document.getElementById("tParkingBank").innerText = formatNumber(parkingBank);
    document.getElementById("tETagBank").innerText = formatNumber(etagBank);

    document.getElementById("tSales").innerText = formatNumber(sales);
    document.getElementById("tExpenses").innerText = formatNumber(expenses);
    document.getElementById("tDeposit").innerText = formatNumber(deposit);
    document.getElementById("tAccount").innerText = formatNumber(account);

    // summary cards
    document.getElementById("sumParkingCash").innerText = "₦" + formatNumber(parkingCash);
    document.getElementById("sumETag").innerText = "₦" + formatNumber(etagCash);
    document.getElementById("sumRevenue").innerText = "₦" + formatNumber(sales);
    document.getElementById("sumExpenses").innerText = "₦" + formatNumber(expenses);
}


// Export table to Excel
function exportTable() {

    const table = document.getElementById("salesTable").outerHTML;

    const selected = monthPicker.value;
    const date = new Date(selected + "-01");

    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    const title = `<h2 style="text-align:center;">
New Kuje Shopping Complex Sales Report (Car Park - ${month} ${year})
</h2>`;

    const html = `
<html>
<head><meta charset="UTF-8"></head>
<body>
${title}
${table}
</body>
</html>`;

    const dataUrl = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Sales-Report-${month}-${year}.xls`;
    link.click();
}


// export button
document.querySelector('.export').addEventListener('click', () => {
    exportTable();
});


// set current month
const today = new Date();
const monthStr = today.toISOString().slice(0, 7);
monthPicker.value = monthStr;


// load data
loadMonth();


// change month
monthPicker.addEventListener("change", loadMonth);