// sales.js
import { SalesData } from "../data/salesdata.js";

const tbody = document.getElementById("salesBody");
const monthPicker = document.getElementById("monthPicker");

// Format numbers
function formatNumber(num) {
    return Number(num || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* =========================
   GET PREVIOUS MONTH BALANCE
========================= */
function getPreviousMonthBalance(selectedMonth) {
    const date = new Date(selectedMonth + "-01");
    date.setMonth(date.getMonth() - 1);
    const prevMonthStr = date.toISOString().slice(0, 7);
    const prevData = SalesData[prevMonthStr];

    if (!prevData) return 0;

    let runningBalance = prevData.openingBalance || 0;
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= days; i++) {
        const d = prevData[i] || {};

        const dailyCash =
            (d.parkingCash || 0) +
            (d.etagCash || 0);

        const deposit = d.deposit || 0;
        const expenses = d.expenses || 0;

        const available = runningBalance + dailyCash;
        const actualDeposit = Math.min(deposit, available);

        runningBalance = available - expenses - actualDeposit;
    }

    return runningBalance;
}

/* =========================
   LOAD MONTH
========================= */
function loadMonth() {
    tbody.innerHTML = "";

    const selected = monthPicker.value;
    const date = new Date(selected + "-01");
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const monthData = SalesData[selected] || {};

    let runningBalance = getPreviousMonthBalance(selected);

    let totalParkingCash = 0;
    let totalETagCash = 0;
    let totalParkingBank = 0;
    let totalETagBank = 0;

    let totalSales = 0;
    let totalExpenses = 0;
    let totalDeposit = 0;
    let totalAccount = 0;

    // Balance B/F row
    tbody.innerHTML += `
<tr style="font-weight:bold; background:#f0f0f0;">
<td>--</td>
<td>Balance B/F</td>
<td colspan="8"></td>
<td>${formatNumber(runningBalance)}</td>
</tr>
`;

    for (let i = 1; i <= days; i++) {
        const d = monthData[i] || {};

        const rowParking =
            (d.parkingCash || 0) +
            (d.parkingBank || 0);

        const rowETag =
            (d.etagCash || 0) +
            (d.etagBank || 0);

        const total = rowParking + rowETag;

        const dailyCash =
            (d.parkingCash || 0) +
            (d.etagCash || 0);

        // Running balance
        runningBalance =
            runningBalance +
            dailyCash -
            (d.expenses || 0) -
            (d.deposit || 0);

        const balance = runningBalance;

        // Totals
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
<td>${d.desc || "Sales"}</td>
<td>${formatNumber(d.parkingCash)}</td>
<td>${formatNumber(d.etagCash)}</td>
<td>${formatNumber(d.parkingBank)}</td>
<td>${formatNumber(d.etagBank)}</td>
<td>${formatNumber(total)}</td>
<td>${formatNumber(d.expenses)}</td>
<td>${formatNumber(d.deposit)}</td>
<td>${formatNumber(d.account)}</td>
<td style="color:${balance < 0 ? 'red' : 'black'}">
${formatNumber(balance)}
</td>
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
        totalAccount,
        runningBalance
    );
}

/* =========================
   TOTALS
========================= */
function calculateTotals(
    parkingCash,
    etagCash,
    parkingBank,
    etagBank,
    sales,
    expenses,
    deposit,
    account,
    finalBalance
) {
    document.getElementById("tParkingCash").innerText = formatNumber(parkingCash);
    document.getElementById("tETagCash").innerText = formatNumber(etagCash);

    document.getElementById("tParkingBank").innerText = formatNumber(parkingBank);
    document.getElementById("tETagBank").innerText = formatNumber(etagBank);

    document.getElementById("tSales").innerText = formatNumber(sales);
    document.getElementById("tExpenses").innerText = formatNumber(expenses);
    document.getElementById("tDeposit").innerText = formatNumber(deposit);
    document.getElementById("tAccount").innerText = formatNumber(account);

    const balanceEl = document.getElementById("tBalance");
    if (balanceEl) balanceEl.innerText = formatNumber(finalBalance);

    document.getElementById("sumParkingCash").innerText =
        "₦" + formatNumber(parkingCash + parkingBank);

    document.getElementById("sumETag").innerText =
        "₦" + formatNumber(etagCash + etagBank);

    document.getElementById("sumRevenue").innerText =
        "₦" + formatNumber(sales);

    document.getElementById("sumExpenses").innerText =
        "₦" + formatNumber(expenses);
}

/* =========================
   MONTHLY SUMMARY
========================= */
function generateMonthlySummary(selected) {
    const data = SalesData[selected] || {};

    let parking = 0;
    let etag = 0;

    Object.values(data).forEach(d => {
        parking += (d.parkingCash || 0) + (d.parkingBank || 0);
        etag += (d.etagCash || 0) + (d.etagBank || 0);
    });

    const total = parking + etag;

    const date = new Date(selected + "-01");
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return {
        text: `The Car Park Unit generated a total revenue of ₦${formatNumber(total)} for ${month} ${year}, consisting of ₦${formatNumber(parking)} from regular ticket sales and ₦${formatNumber(etag)} from E-Tag subscriptions.`,
        month,
        year
    };
}

/* =========================
   EXPORT
========================= */
function exportTable() {
    const selected = monthPicker.value;
    const summary = generateMonthlySummary(selected);

    const table = document.getElementById("salesTable").outerHTML;
    const styledTable = table.replace('<table', '<table class="report-table">');

    const title = `
<div class="header">
<h1>New Kuje Shopping Complex</h1>
<h2>Car Park Sales Report</h2>
<h3>${summary.month} ${summary.year}</h3>
</div>
`;

    const footer = `<br>
<div class="summary-box">
<h3>MONTHLY SALES SUMMARY</h3>
<p>${summary.text}</p>
</div>
<div class="prepared">
<strong>Report Generated By:</strong><br> ParkFlow System ${new Date().toLocaleString()}
</div>
`;

    const html = `
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'Segoe UI', sans-serif; padding:20px; color:#333; background:#f9f9f9; }
.report-table { width:100%; border-collapse:collapse; background:#fff; }
.report-table th, .report-table td { border:1px solid #ccc; padding:6px; text-align:right; }
.report-table th:nth-child(2), .report-table td:nth-child(2) { text-align:left; }
.report-table th { background:#0d47a1; color:white; }
.summary-box { background:#e3f2fd; border-left:6px solid #0d47a1; padding:15px; margin-top:30px; }
.summary-box h3 { text-align:center; text-decoration:underline; color:#0d47a1; }
.prepared { margin-top:20px; font-size:12px; }
</style>
</head>
<body>
${title}
${styledTable}
${footer}
</body>
</html>
`;

    const dataUrl = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `Sales-Report-${summary.month}-${summary.year}.xls`;
    link.click();
}

/* =========================
   INIT
========================= */
monthPicker.value = new Date().toISOString().slice(0, 7);
loadMonth();
monthPicker.addEventListener("change", loadMonth);
document.querySelector('.export').addEventListener('click', exportTable);