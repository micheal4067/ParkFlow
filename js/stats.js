// stats.js

import { SalesData, etags } from "../data/salesdata.js";
import { staffData } from "../data/data.js";

document.addEventListener("DOMContentLoaded", () => {

/* =========================
   CURRENT DATE
========================= */
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

/* =========================
   MONTH PICKER
========================= */
const header = document.querySelector(".header-title");

const monthPicker = document.createElement("input");
monthPicker.type = "month";
monthPicker.value = `${currentYear}-${currentMonth}`;
monthPicker.id = "monthPicker";
header.appendChild(monthPicker);

/* =========================
   KPI ELEMENTS
========================= */

// MONTH
const monthRevenueEl = document.getElementById("monthRevenue");
const monthTicketsEl = document.getElementById("monthTickets");
const monthSoldTagsEl = document.getElementById("monthSoldTags");
const monthActiveTagsEl = document.getElementById("monthActiveTags");
const monthExpiredTagsEl = document.getElementById("monthExpiredTags");

const monthExtraTagsEl = document.getElementById("monthExtraTags");
const monthParkingRevenueEl = document.getElementById("monthParkingRevenue");
const monthETagRevenueEl = document.getElementById("monthETagRevenue");
const monthExpensesEl = document.getElementById("monthExpenses");

// YEAR
const yearRevenueEl = document.getElementById("yearRevenue");
const yearTicketsEl = document.getElementById("yearTickets");
const yearSoldTagsEl = document.getElementById("yearSoldTags");
const yearActiveTagsEl = document.getElementById("yearActiveTags");
const yearExpiredTagsEl = document.getElementById("yearExpiredTags");

const yearExtraTagsEl = document.getElementById("yearExtraTags");
const yearParkingRevenueEl = document.getElementById("yearParkingRevenue");
const yearETagRevenueEl = document.getElementById("yearETagRevenue");
const yearExpensesEl = document.getElementById("yearExpenses");

const staffCountEl = document.getElementById("staffCount");

/* =========================
   CHART CONTEXT
========================= */
const revenueCtx = document.getElementById("monthlyRevenueChart").getContext("2d");
const ticketCtx = document.getElementById("ticketDistributionChart").getContext("2d");
const etagCtx = document.getElementById("etagUsageChart").getContext("2d");

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* =========================
   HELPERS
========================= */

// UNIQUE SUBSCRIBERS
function countUniqueSubscribers(tagsList) {
    const unique = new Set();
    tagsList.forEach(tag => {
        unique.add((tag.name || "").trim().toLowerCase());
    });
    return unique.size;
}

// EXTRA TAGS (DUPLICATES)
function calculateExtraTags(tagsList) {
    const counts = {};
    let extra = 0;

    tagsList.forEach(tag => {
        const name = (tag.name || "").trim().toLowerCase();

        counts[name] = (counts[name] || 0) + 1;

        if (counts[name] > 1) extra++;
    });

    return extra;
}

// SALES CALCULATOR
function calculateMonthTotals(monthData = {}) {

    let revenue = 0;
    let tickets = 0;

    let parkingRevenue = 0;
    let etagRevenue = 0;
    let expenses = 0;

    Object.values(monthData).forEach(day => {

        const parking = (day.parkingCash || 0) + (day.parkingBank || 0);
        const etag = (day.etagCash || 0) + (day.etagBank || 0);

        parkingRevenue += parking;
        etagRevenue += etag;

        revenue += parking + etag;
        tickets += day.tickets || 0;

        expenses += day.expenses || 0;
    });

    return { revenue, tickets, parkingRevenue, etagRevenue, expenses };
}

/* =========================
   ANNUAL DATA
========================= */

const annualRevenue = [];
const annualTickets = [];
const annualActivatedTags = [];

let totalYearParking = 0;
let totalYearETag = 0;
let totalYearExpenses = 0;

months.forEach((m,i)=>{

    const monthKey = `${currentYear}-${String(i+1).padStart(2,"0")}`;
    const monthData = SalesData[monthKey] || {};

    const result = calculateMonthTotals(monthData);

    annualRevenue.push(result.revenue);
    annualTickets.push(result.tickets);

    totalYearParking += result.parkingRevenue;
    totalYearETag += result.etagRevenue;
    totalYearExpenses += result.expenses;

    const activated = etags.filter(tag =>
        tag.activated.startsWith(monthKey)
    ).length;

    annualActivatedTags.push(activated);
});

/* =========================
   YEAR TAG DATA
========================= */

const yearActivatedTags = etags.filter(tag =>
    new Date(tag.activated).getFullYear() === currentYear
);

const yearSubscribers = countUniqueSubscribers(yearActivatedTags);
const yearExtraTags = calculateExtraTags(yearActivatedTags);

const yearExpiredTags = etags.filter(tag =>
    new Date(tag.expires) < today
).length;

const yearActiveTags = etags.filter(tag =>
    new Date(tag.expires) >= today
).length;

/* =========================
   YEAR TOTALS
========================= */

const totalYearRevenue = annualRevenue.reduce((a,b)=>a+b,0);
const totalYearTickets = annualTickets.reduce((a,b)=>a+b,0);

/* =========================
   UPDATE YEAR KPIs
========================= */

yearRevenueEl.textContent = "₦" + totalYearRevenue.toLocaleString();
yearTicketsEl.textContent = totalYearTickets.toLocaleString();
yearSoldTagsEl.textContent = yearSubscribers;
yearActiveTagsEl.textContent = yearActiveTags;
yearExpiredTagsEl.textContent = yearExpiredTags;

yearExtraTagsEl.textContent = yearExtraTags;
yearParkingRevenueEl.textContent = "₦" + totalYearParking.toLocaleString();
yearETagRevenueEl.textContent = "₦" + totalYearETag.toLocaleString();
yearExpensesEl.textContent = "₦" + totalYearExpenses.toLocaleString();

staffCountEl.textContent = staffData.length;

/* =========================
   LOAD MONTH
========================= */

function loadMonthStats(monthStr){

    const monthData = SalesData[monthStr] || {};
    const result = calculateMonthTotals(monthData);

    const monthActivatedTags = etags.filter(tag =>
        tag.activated.startsWith(monthStr)
    );

    const monthSubscribers = countUniqueSubscribers(monthActivatedTags);
    const monthExtraTags = calculateExtraTags(monthActivatedTags);

    const monthExpiredTags = etags.filter(tag =>
        tag.expires.startsWith(monthStr)
    ).length;

    const monthActiveTags = monthActivatedTags.length - monthExpiredTags;

    // MAIN KPIs
    monthRevenueEl.textContent = "₦" + result.revenue.toLocaleString();
    monthTicketsEl.textContent = result.tickets.toLocaleString();
    monthSoldTagsEl.textContent = monthSubscribers;

    monthActiveTagsEl.textContent = monthActiveTags;
    monthExpiredTagsEl.textContent = monthExpiredTags;

    // NEW KPIs
    monthExtraTagsEl.textContent = monthExtraTags;
    monthParkingRevenueEl.textContent = "₦" + result.parkingRevenue.toLocaleString();
    monthETagRevenueEl.textContent = "₦" + result.etagRevenue.toLocaleString();
    monthExpensesEl.textContent = "₦" + result.expenses.toLocaleString();
}

/* =========================
   CHARTS
========================= */

new Chart(revenueCtx,{
    type:"bar",
    data:{
        labels:months,
        datasets:[{
            label:"Revenue",
            data:annualRevenue,
            backgroundColor:"#6366f1"
        }]
    },
    options:{ responsive:true }
});

new Chart(ticketCtx,{
    type:"doughnut",
    data:{
        labels:months,
        datasets:[{
            data:annualTickets,
            backgroundColor:[
                "#3b82f6","#6366f1","#8b5cf6",
                "#10b981","#22c55e","#14b8a6",
                "#f59e0b","#f97316","#ef4444",
                "#ec4899","#a855f7","#06b6d4"
            ]
        }]
    },
    options:{ responsive:true }
});

new Chart(etagCtx,{
    type:"bar",
    data:{
        labels:months,
        datasets:[{
            label:"Activated Tags",
            data:annualActivatedTags,
            backgroundColor:"#f59e0b"
        }]
    },
    options:{ responsive:true }
});

/* =========================
   INIT
========================= */

loadMonthStats(`${currentYear}-${currentMonth}`);

monthPicker.addEventListener("change", e => {
    loadMonthStats(e.target.value);
});

});