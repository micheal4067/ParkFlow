// stats.js

import { SalesData, etags } from "../data/salesdata.js";
import { staffData } from "../data/data.js";

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT DATE
    ========================= */

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2,"0");

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

    const monthRevenueEl = document.getElementById("monthRevenue");
    const monthTicketsEl = document.getElementById("monthTickets");
    const monthSoldTagsEl = document.getElementById("monthSoldTags");
    const monthActiveTagsEl = document.getElementById("monthActiveTags");
    const monthExpiredTagsEl = document.getElementById("monthExpiredTags");

    const yearRevenueEl = document.getElementById("yearRevenue");
    const yearTicketsEl = document.getElementById("yearTickets");
    const yearSoldTagsEl = document.getElementById("yearSoldTags");
    const yearExpiredTagsEl = document.getElementById("yearExpiredTags");

    const staffCountEl = document.getElementById("staffCount");

    /* =========================
       CHART CONTEXT
    ========================= */

    const revenueCtx = document
        .getElementById("monthlyRevenueChart")
        .getContext("2d");

    const ticketCtx = document
        .getElementById("ticketDistributionChart")
        .getContext("2d");

    const etagCtx = document
        .getElementById("etagUsageChart")
        .getContext("2d");

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    /* =========================
       ANNUAL DATA ARRAYS
    ========================= */

    const annualRevenue = [];
    const annualTickets = [];
    const annualETagRevenue = [];

    let totalYearRevenue = 0;
    let totalYearTickets = 0;

    months.forEach((m, i) => {

        const monthKey = `${currentYear}-${String(i+1).padStart(2,"0")}`;
        const monthData = SalesData[monthKey] || {};

        let revenue = 0;
        let tickets = 0;
        let etagRevenue = 0;

        Object.values(monthData).forEach(day => {

            revenue +=
                (day.parkingCash || 0) +
                (day.parkingBank || 0) +
                (day.etagCash || 0) +
                (day.etagBank || 0);

            tickets += day.tickets || 0;

            etagRevenue +=
                (day.etagCash || 0) +
                (day.etagBank || 0);

        });

        annualRevenue.push(revenue);
        annualTickets.push(tickets);
        annualETagRevenue.push(etagRevenue);

        totalYearRevenue += revenue;
        totalYearTickets += tickets;

    });

    /* =========================
       YEAR TAG STATISTICS
    ========================= */

    const yearSoldTags = etags.length;

    const yearExpiredTags = etags.filter(tag =>
        new Date(tag.expires).getFullYear() === currentYear &&
        new Date(tag.expires) < today
    ).length;

    /* =========================
       UPDATE YEAR KPIs
    ========================= */

    yearRevenueEl.textContent =
        "₦" + totalYearRevenue.toLocaleString();

    yearTicketsEl.textContent =
        totalYearTickets.toLocaleString();

    yearSoldTagsEl.textContent =
        yearSoldTags;

    yearExpiredTagsEl.textContent =
        yearExpiredTags;

    staffCountEl.textContent =
        staffData.length;

    /* =========================
       MONTH DATA FUNCTION
    ========================= */

    function loadMonthStats(monthStr){

        const monthData = SalesData[monthStr] || {};

        let revenue = 0;
        let tickets = 0;

        Object.values(monthData).forEach(day => {

            revenue +=
                (day.parkingCash || 0) +
                (day.parkingBank || 0) +
                (day.etagCash || 0) +
                (day.etagBank || 0);

            tickets += day.tickets || 0;

        });

        /* ---- TAG DATA ---- */

        const monthSoldTags = etags.filter(tag =>
            tag.activated.startsWith(monthStr)
        ).length;

        const monthActiveTags = etags.filter(tag =>
            tag.activated.startsWith(monthStr)
        ).length;

        const monthExpiredTags = etags.filter(tag =>
            tag.expires.startsWith(monthStr)
        ).length;

        /* ---- UPDATE MONTH KPIs ---- */

        monthRevenueEl.textContent =
            "₦" + revenue.toLocaleString();

        monthTicketsEl.textContent =
            tickets.toLocaleString();

        monthSoldTagsEl.textContent =
            monthSoldTags;

        monthActiveTagsEl.textContent =
            monthActiveTags;

        monthExpiredTagsEl.textContent =
            monthExpiredTags;

    }

    /* =========================
       CHARTS
    ========================= */

    new Chart(revenueCtx, {

        type:"bar",

        data:{
            labels:months,

            datasets:[{
                label:"Revenue",
                data:annualRevenue,
                backgroundColor:"#6366f1"
            }]
        },

        options:{
            responsive:true,
            plugins:{legend:{display:false}},
            scales:{y:{beginAtZero:true}}
        }

    });

    new Chart(ticketCtx, {

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

        options:{
            responsive:true,
            plugins:{legend:{position:"bottom"}}
        }

    });

    new Chart(etagCtx, {

        type:"bar",

        data:{
            labels:months,

            datasets:[{
                label:"E-Tag Revenue",
                data:annualETagRevenue,
                backgroundColor:"#f59e0b"
            }]
        },

        options:{
            responsive:true,
            plugins:{legend:{display:false}},
            scales:{y:{beginAtZero:true}}
        }

    });

    /* =========================
       INITIAL LOAD
    ========================= */

    loadMonthStats(`${currentYear}-${currentMonth}`);

    /* =========================
       MONTH CHANGE
    ========================= */

    monthPicker.addEventListener("change", e=>{
        loadMonthStats(e.target.value);
    });

});