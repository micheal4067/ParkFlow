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
    const naira = "₦";

    return {
        text: `The Car Park Unit generated a total revenue of ${naira}${formatNumber(total)} for ${month} ${year}, consisting of ${naira}${formatNumber(parking)} from regular ticket sales and ${naira}${formatNumber(etag)} from E-Tag subscriptions.`,
        month,
        year
    };
}


function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const selected = monthPicker.value;
    const summary = generateMonthlySummary(selected);
    const data = SalesData[selected] || {};

    const date = new Date(selected + "-01");
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    let runningBalance = getPreviousMonthBalance(selected);
    const balanceBF = runningBalance;

    // =========================
    // HEADER
    // =========================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NEW KUJE SHOPPING COMPLEX SALES REPORT", 105, 15, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`(Car Park - ${summary.month} ${summary.year})`, 105, 22, { align: "center" });

    // =========================
    // ACCOUNT BOX
    // =========================
    doc.rect(14, 28, 182, 18);

    doc.setFillColor(0, 0, 0);
    doc.rect(14, 28, 182, 6, "F");

    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text("ACCOUNT", 105, 32, { align: "center" });

    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.text("MONIEPOINT 5058523746   Okiky Hotel and Suites Ltd (car park proceed)", 16, 40);

    // =========================
    // TABLE DATA
    // =========================
    const body = [];

    let totalParkingCash = 0, totalETagCash = 0, totalParkingBank = 0, totalETagBank = 0;
    let totalSales = 0, totalExpenses = 0, totalDeposit = 0, totalAccount = 0;

    // Balance B/F
    body.push(["--","Balance B/F","","","","","","","","",formatNumber(runningBalance)]);

    for (let i = 1; i <= days; i++) {
        const d = data[i] || {};

        const rowParkingCash = d.parkingCash || 0;
        const rowETagCash = d.etagCash || 0;
        const rowParkingBank = d.parkingBank || 0;
        const rowETagBank = d.etagBank || 0;
        const rowExpenses = d.expenses || 0;
        const rowDeposit = d.deposit || 0;
        const rowAccount = d.account || 0;

        const total = rowParkingCash + rowETagCash + rowParkingBank + rowETagBank;
        const dailyCash = rowParkingCash + rowETagCash;

        runningBalance = runningBalance + dailyCash - rowExpenses - rowDeposit;

        body.push([
            String(i).padStart(2,"0"),
            d.desc || "Sales",
            formatNumber(rowParkingCash),
            formatNumber(rowETagCash),
            formatNumber(rowParkingBank),
            formatNumber(rowETagBank),
            formatNumber(total),
            formatNumber(rowExpenses),
            formatNumber(rowDeposit),
            formatNumber(rowAccount),
            formatNumber(runningBalance)
        ]);

        totalParkingCash += rowParkingCash;
        totalETagCash += rowETagCash;
        totalParkingBank += rowParkingBank;
        totalETagBank += rowETagBank;
        totalSales += total;
        totalExpenses += rowExpenses;
        totalDeposit += rowDeposit;
        totalAccount += rowAccount;
    }

    // TOTAL row
    body.push([
        "", "TOTAL",
        formatNumber(totalParkingCash),
        formatNumber(totalETagCash),
        formatNumber(totalParkingBank),
        formatNumber(totalETagBank),
        formatNumber(totalSales),
        formatNumber(totalExpenses),
        formatNumber(totalDeposit),
        formatNumber(totalAccount),
        formatNumber(runningBalance)
    ]);

    // =========================
    // TABLE
    // =========================
    doc.autoTable({
        startY: 50,
        head: [[
            "Date","Description","Parking Cash","E-Tag Cash","Parking Bank","E-Tag Bank",
            "Total Sales","Expenses","Deposit","Account","Cash Balance"
        ]],
        body: body,
        styles: { fontSize: 7, halign: "right" },
        headStyles: { fillColor: [0,0,0], textColor: 255, halign: "center" },
        columnStyles: { 1: { halign: "left" } },
        didParseCell: function(dataCell) {
            const row = dataCell.row.raw;

            if(row[1] === "OFF") {
                dataCell.cell.styles.fillColor = [0,0,0];
                dataCell.cell.styles.textColor = 255;
            }

            if(dataCell.row.index === body.length - 1) {
                dataCell.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // =========================
    // FORCE PAGE 2 FOR SUMMARY
    // =========================
    doc.addPage();
    let y = 20;

    // =========================
    // SUMMARY BOX
    // =========================
    const totalCashGenerated = totalParkingCash + totalETagCash;
    const totalParkingTotal = totalParkingCash + totalParkingBank;
    const totalETagTotal = totalETagCash + totalETagBank;
    const endingBalance = runningBalance;

    // Box
    doc.rect(14, y, 182, 68);

    // Header
    doc.setFillColor(0,0,0);
    doc.rect(14, y, 182, 7, "F");

    doc.setTextColor(255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(10);
    doc.text("MONTHLY SALES SUMMARY", 105, y + 5, { align: "center" });

    doc.setTextColor(0);
    doc.setFontSize(9);

    let lineY = y + 12;

    doc.setFont("helvetica","normal");
    doc.text(`For ${summary.month} ${summary.year}, the Car Park Unit generated:`, 16, lineY);

    lineY += 6;

    const addLine = (label, value, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.text(label, 18, lineY);
        doc.text(`₦${formatNumber(value)}`, 130, lineY);
        lineY += 6;
    };

    addLine("• Total Revenue:", totalSales, true);
    addLine("• Parking Sales:", totalParkingTotal);
    addLine("• E-Tag Sales:", totalETagTotal);

    lineY += 2;
    doc.line(16, lineY, 190, lineY);
    lineY += 7;

    // Balance B/F
    addLine("• Balance B/F (Brought Forward):", balanceBF);

    // Cash Generated
    addLine("• Total Cash Generated:", totalCashGenerated, true);
    addLine("• Total Deposit Made:", totalDeposit);

    // Ending Balance
    doc.setFont("helvetica","bold");
    doc.text("• Ending Balance:", 18, lineY);

    doc.setTextColor(endingBalance < 0 ? 255 : 0, endingBalance < 0 ? 0 : 128, 0);
    doc.text(`₦${formatNumber(endingBalance)}`, 130, lineY);
    doc.setTextColor(0);

    // =========================
    // FOOTER
    // =========================
    let footerY = lineY + 12;

    const now = new Date().toLocaleString();

    doc.setFont("helvetica","normal");
    doc.setFontSize(8);
    doc.text("Report Generated with:", 14, footerY);

    doc.setFont("helvetica","bold");
    doc.text(`ParkFlow System (${now})`, 14, footerY + 5);

    doc.setTextColor(0,0,255);
    doc.textWithLink(
        "kujeshoppingcomplexparkflow.netlify.app",
        14, footerY + 10,
        { url: "https://kujeshoppingcomplexparkflow.netlify.app" }
    );

    doc.setTextColor(0);

    // =========================
    // SAVE
    // =========================
    doc.save(`Sales-Report-${summary.month}-${summary.year}.pdf`);
}

function downloadWord() {
    const selected = monthPicker.value;
    const summary = generateMonthlySummary(selected);
    const data = SalesData[selected] || {};

    const date = new Date(selected + "-01");
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    let runningBalance = getPreviousMonthBalance(selected);
    const balanceBF = runningBalance;

    let rows = "";

    let totalParkingCash = 0, totalETagCash = 0, totalParkingBank = 0, totalETagBank = 0;
    let totalSales = 0, totalExpenses = 0, totalDeposit = 0, totalAccount = 0;

    // =========================
    // BALANCE B/F
    // =========================
    rows += `
    <tr style="font-weight:bold; background:#f2f2f2;">
        <td>--</td>
        <td>Balance B/F</td>
        <td colspan="8"></td>
        <td>${formatNumber(balanceBF)}</td>
    </tr>
    `;

    // =========================
    // DAILY ROWS
    // =========================
    for (let i = 1; i <= days; i++) {
        const d = data[i] || {};

        const parkingCash = d.parkingCash || 0;
        const etagCash = d.etagCash || 0;
        const parkingBank = d.parkingBank || 0;
        const etagBank = d.etagBank || 0;
        const expenses = d.expenses || 0;
        const deposit = d.deposit || 0;
        const account = d.account || 0;

        const total = parkingCash + etagCash + parkingBank + etagBank;
        const dailyCash = parkingCash + etagCash;

        runningBalance = runningBalance + dailyCash - expenses - deposit;

        const isOff = (d.desc || "").toUpperCase() === "OFF";

        rows += `
        <tr style="${isOff ? 'background:black; color:white; font-weight:bold;' : ''}">
            <td>${String(i).padStart(2, "0")}</td>
            <td>${d.desc || "Sales"}</td>
            <td>${formatNumber(parkingCash)}</td>
            <td>${formatNumber(etagCash)}</td>
            <td>${formatNumber(parkingBank)}</td>
            <td>${formatNumber(etagBank)}</td>
            <td>${formatNumber(total)}</td>
            <td>${formatNumber(expenses)}</td>
            <td>${formatNumber(deposit)}</td>
            <td>${formatNumber(account)}</td>
            <td style="color:${isOff ? 'white' : (runningBalance < 0 ? 'red' : '#0a7d00')}">
                ${formatNumber(runningBalance)}
            </td>
        </tr>
        `;

        totalParkingCash += parkingCash;
        totalETagCash += etagCash;
        totalParkingBank += parkingBank;
        totalETagBank += etagBank;
        totalSales += total;
        totalExpenses += expenses;
        totalDeposit += deposit;
        totalAccount += account;
    }

    // =========================
    // TOTAL ROW
    // =========================
    rows += `
    <tr style="font-weight:bold; background:#eaeaea;">
        <td></td>
        <td>TOTAL</td>
        <td>${formatNumber(totalParkingCash)}</td>
        <td>${formatNumber(totalETagCash)}</td>
        <td>${formatNumber(totalParkingBank)}</td>
        <td>${formatNumber(totalETagBank)}</td>
        <td>${formatNumber(totalSales)}</td>
        <td>${formatNumber(totalExpenses)}</td>
        <td>${formatNumber(totalDeposit)}</td>
        <td>${formatNumber(totalAccount)}</td>
        <td>${formatNumber(runningBalance)}</td>
    </tr>
    `;

    // =========================
    // SUMMARY VALUES
    // =========================
    const totalCashGenerated = totalParkingCash + totalETagCash;
    const totalParkingTotal = totalParkingCash + totalParkingBank;
    const totalETagTotal = totalETagCash + totalETagBank;
    const endingBalance = runningBalance;

    // =========================
    // CLEAN SUMMARY CARD
    // =========================
    const summaryBox = `
    <div style="width:85%; margin:40px auto; font-size:12px;">

        <div style="text-align:center; font-weight:bold; font-size:14px; margin-bottom:10px;">
            Monthly Sales Summary
        </div>

        <div style="text-align:center; margin-bottom:15px;">
            ${summary.month} ${summary.year}
        </div>

        <div style="
            border:1px solid #ddd;
            border-radius:6px;
            padding:18px;
            background:#fafafa;
        ">

            <div style="display:flex; justify-content:space-between;">
                <span><b>Total Revenue</b></span>
                <span><b>₦${formatNumber(totalSales)}</b></span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:6px;">
                <span>Parking Sales</span>
                <span>₦${formatNumber(totalParkingTotal)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:4px;">
                <span>E-Tag Sales</span>
                <span>₦${formatNumber(totalETagTotal)}</span>
            </div>

            <div style="border-top:1px solid #ddd; margin:12px 0;"></div>

            <div style="display:flex; justify-content:space-between;">
                <span>Balance B/F</span>
                <span>₦${formatNumber(balanceBF)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:6px;">
                <span><b>Cash Generated</b></span>
                <span><b>₦${formatNumber(totalCashGenerated)}</b></span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:6px;">
                <span>Deposits</span>
                <span>₦${formatNumber(totalDeposit)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px;">
                <span><b>Ending Balance</b></span>
                <span style="color:${endingBalance < 0 ? 'red' : '#0a7d00'};">
                    <b>₦${formatNumber(endingBalance)}</b>
                </span>
            </div>

        </div>
    </div>
    `;

    // =========================
    // FULL DOCUMENT
    // =========================
    const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'>
    <head>
        <meta charset="utf-8">

        <style>
            body {
                font-family: Calibri, "Segoe UI", Arial, sans-serif;
                margin: 20px;
            }

            h2 {
                text-align: center;
                margin-bottom: 5px;
            }

            h3 {
                text-align: center;
                margin-top: 0;
                margin-bottom: 20px;
                font-weight: normal;
            }

            p {
                margin-left: 5%;
                font-size: 12px;
            }

            table {
                border-collapse: collapse;
                width: 90%;
                margin: auto;
                font-size: 11px;
            }

            th, td {
                border: 1px solid black;
                padding: 6px;
                text-align: right;
            }

            th {
                background: black;
                color: white;
                text-align: center;
            }

            td:nth-child(2) {
                text-align: left;
            }
        </style>
    </head>

    <body>

        <h2>NEW KUJE SHOPPING COMPLEX SALES REPORT</h2>
        <h3>(Car Park - ${summary.month} ${summary.year})</h3>

        <p><b>Account:</b> MONIEPOINT 5058523746 — Okiky Hotel and Suites Ltd</p>

        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Parking Cash</th>
                    <th>E-Tag Cash</th>
                    <th>Parking Bank</th>
                    <th>E-Tag Bank</th>
                    <th>Total Sales</th>
                    <th>Expenses</th>
                    <th>Deposit</th>
                    <th>Account</th>
                    <th>Cash Balance</th>
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>
        </table>

        ${summaryBox}

        <div style="
            width:85%;
            margin:20px auto 0;
            font-size:10px;
            color:#555;
            border-top:1px solid #ddd;
            padding-top:10px;
            line-height:1.5;
        ">

            <div>
                Report generated with <b>ParkFlow System</b>
            </div>

            <div>
                ${new Date().toLocaleString()}
            </div>

            <div style="margin-top:4px;">
                <a href="https://kujeshoppingcomplexparkflow.netlify.app" 
                style="color:#1a73e8; text-decoration:none;">
                kujeshoppingcomplexparkflow.netlify.app
                </a>
            </div>

        </div>

    </body>
    </html>
    `;

    // =========================
    // DOWNLOAD
    // =========================
    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Sales-Report-${summary.month}-${summary.year}.doc`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


document.querySelector('.pdf').addEventListener('click', downloadPDF);

document.querySelector('.word').addEventListener('click', downloadWord);

/* =========================
   INIT
========================= */
monthPicker.value = new Date().toISOString().slice(0, 7);
loadMonth();
monthPicker.addEventListener("change", loadMonth);