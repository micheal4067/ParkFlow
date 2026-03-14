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

    const monthRevenueEl = document.getElementById("monthRevenue");
    const monthTicketsEl = document.getElementById("monthTickets");
    const monthSoldTagsEl = document.getElementById("monthSoldTags");
    const monthActiveTagsEl = document.getElementById("monthActiveTags");
    const monthExpiredTagsEl = document.getElementById("monthExpiredTags");

    const yearRevenueEl = document.getElementById("yearRevenue");
    const yearTicketsEl = document.getElementById("yearTickets");
    const yearSoldTagsEl = document.getElementById("yearSoldTags");
    const yearActiveTagsEl = document.getElementById("yearActiveTags");
    const yearExpiredTagsEl = document.getElementById("yearExpiredTags");

    const staffCountEl = document.getElementById("staffCount");

    /* =========================
       CHART CONTEXT
    ========================= */

    const revenueCtx = document.getElementById("monthlyRevenueChart").getContext("2d");
    const ticketCtx = document.getElementById("ticketDistributionChart").getContext("2d");
    const etagCtx = document.getElementById("etagUsageChart").getContext("2d");

    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    /* =========================
       HELPER FUNCTION
    ========================= */

    function calculateMonthTotals(monthData = {}) {

        let revenue = 0;
        let tickets = 0;
        let etagRevenue = 0;

        Object.values(monthData).forEach(day => {

            const parkingCash = day.parkingCash || 0;
            const parkingBank = day.parkingBank || 0;
            const etagCash = day.etagCash || 0;
            const etagBank = day.etagBank || 0;

            revenue += parkingCash + parkingBank + etagCash + etagBank;
            tickets += day.tickets || 0;
            etagRevenue += etagCash + etagBank;

        });

        return { revenue, tickets, etagRevenue };
    }

    /* =========================
       ANNUAL DATA
    ========================= */

    const annualRevenue = [];
    const annualTickets = [];
    const annualETagRevenue = [];

    months.forEach((m, i) => {

        const monthKey = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
        const monthData = SalesData[monthKey] || {};

        const { revenue, tickets, etagRevenue } = calculateMonthTotals(monthData);

        annualRevenue.push(revenue);
        annualTickets.push(tickets);
        annualETagRevenue.push(etagRevenue);

    });

    /* =========================
       YEAR TOTALS
    ========================= */

    const totalYearRevenue = annualRevenue.reduce((a,b)=>a+b,0);
    const totalYearTickets = annualTickets.reduce((a,b)=>a+b,0);
    const totalYearETagRevenue = annualETagRevenue.reduce((a,b)=>a+b,0);

    const yearSoldTags = Math.floor(totalYearETagRevenue / 7500);

    const yearExpiredTags = etags.filter(tag =>
        new Date(tag.expires).getFullYear() === currentYear &&
        new Date(tag.expires) < today
    ).length;

    const yearActiveTags = yearSoldTags - yearExpiredTags;

    /* =========================
       UPDATE YEAR KPIs
    ========================= */

    yearRevenueEl.textContent = "₦" + totalYearRevenue.toLocaleString();
    yearTicketsEl.textContent = totalYearTickets.toLocaleString();
    yearSoldTagsEl.textContent = yearSoldTags.toLocaleString();
    yearActiveTagsEl.textContent = yearActiveTags.toLocaleString();
    yearExpiredTagsEl.textContent = yearExpiredTags.toLocaleString();
    staffCountEl.textContent = staffData.length;

    /* =========================
       LOAD MONTH STATS
    ========================= */

    function loadMonthStats(monthStr){

        const monthData = SalesData[monthStr] || {};

        const { revenue, tickets, etagRevenue } = calculateMonthTotals(monthData);

        const monthSoldTags = Math.floor(etagRevenue / 7500);

        const monthExpiredTags = etags.filter(tag =>
            tag.expires.startsWith(monthStr)
        ).length;

        const monthActiveTags = monthSoldTags - monthExpiredTags;

        monthRevenueEl.textContent = "₦" + revenue.toLocaleString();
        monthTicketsEl.textContent = tickets.toLocaleString();
        monthSoldTagsEl.textContent = monthSoldTags.toLocaleString();
        monthActiveTagsEl.textContent = monthActiveTags.toLocaleString();
        monthExpiredTagsEl.textContent = monthExpiredTags.toLocaleString();

    }

    /* =========================
       CHARTS
    ========================= */

    const annualETagSold = annualETagRevenue.map(v => Math.floor(v / 7500));

    new Chart(revenueCtx, {
        type: "bar",
        data: {
            labels: months,
            datasets: [{
                label: "Revenue",
                data: annualRevenue,
                backgroundColor: "#6366f1"
            }]
        },
        options: {
            responsive: true,
            plugins:{legend:{display:false}},
            scales:{y:{beginAtZero:true}}
        }
    });

    new Chart(ticketCtx, {
        type: "doughnut",
        data: {
            labels: months,
            datasets: [{
                data: annualTickets,
                backgroundColor: [
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

    new Chart(etagCtx,{
        type:"bar",
        data:{
            labels:months,
            datasets:[{
                label:"E-Tag Sold",
                data:annualETagSold,
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
       MONTH CHANGE EVENT
    ========================= */

    monthPicker.addEventListener("change", e=>{
        loadMonthStats(e.target.value);
    });

});