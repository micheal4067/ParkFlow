// dashboard.js
import { SalesData } from "../data/salesdata.js";
import { staffData } from "../data/data.js";

document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // CURRENT YEAR
  // ============================
  const year = new Date().getFullYear();
  const yearRevenueLabel = document.querySelector('.kpi-card.gradient2 span');
  yearRevenueLabel.textContent = `Year Revenue (${year})`;

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  // KPI elements
  const monthSales = document.getElementById("monthSales");
  const staffCount = document.getElementById("staffCount");
  staffCount.textContent = staffData.length;

  // ============================
  // CALCULATE YEAR DATA
  // ============================
  let totalRevenue = 0;
  const monthlyRevenue = [];
  const monthlyTickets = [];

  months.forEach((m, i) => {
    const key = `${year}-${String(i + 1).padStart(2, "0")}`;
    const month = SalesData[key] || {};

    let revenue = 0;
    let tickets = 0;

    Object.values(month).forEach(day => {
      const dayRevenue =
        (day.parkingCash || 0) +
        (day.parkingBank || 0) +
        (day.etagCash || 0) +
        (day.etagBank || 0) +
        (day.extraTagCash || 0) +    // ✅ Include additional E-Tag cash
        (day.extraTagBank || 0);     // ✅ Include additional E-Tag bank

      revenue += dayRevenue;
      tickets += day.tickets || 0;
    });

    monthlyRevenue.push(revenue);
    monthlyTickets.push(tickets);
    totalRevenue += revenue;
  });

  // ============================
  // KPI VALUES
  // ============================
  monthSales.textContent = "₦" + totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ============================
  // MONTHLY REVENUE CHART
  // ============================
  const revenueCtx = document.getElementById("monthlyRevenueChart").getContext("2d");

  new Chart(revenueCtx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [{
        label: "Monthly Revenue",
        data: monthlyRevenue,
        backgroundColor: "#6366f1",
        borderRadius: 6,
        hoverBackgroundColor: "#4f46e5"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#eee" }
        },
        x: { grid: { display: false } }
      },
      animation: { duration: 1200, easing: "easeOutQuart" }
    }
  });

  // ============================
  // TICKET DISTRIBUTION CHART
  // ============================
  const ticketCtx = document.getElementById("ticketDistributionChart").getContext("2d");

  new Chart(ticketCtx, {
    type: "doughnut",
    data: {
      labels: months,
      datasets: [{
        data: monthlyTickets,
        backgroundColor: [
          "#3b82f6","#10b981","#f59e0b","#ef4444",
          "#6366f1","#8b5cf6","#14b8a6","#22c55e",
          "#f97316","#eab308","#06b6d4","#a855f7"
        ],
        borderWidth: 0
      }]
    },
    options: {
      cutout: "65%",
      plugins: { legend: { position: "bottom" } },
      animation: { animateRotate: true, duration: 1500 }
    }
  });

});