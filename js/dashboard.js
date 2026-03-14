import { SalesData } from "../data/salesdata.js";
import { staffData } from "../data/data.js";

document.addEventListener("DOMContentLoaded", () => {

// ============================
// CURRENT YEAR
// ============================

const year = new Date().getFullYear();
// Select the span inside the "Year Revenue" card
const yearRevenueLabel = document.querySelector('.kpi-card.gradient2 span');

// Update the label to include the current year dynamically
yearRevenueLabel.textContent = `Year Revenue (${year})`;

const months = [
"Jan","Feb","Mar","Apr","May","Jun",
"Jul","Aug","Sep","Oct","Nov","Dec"
];

// KPI elements
const monthSales = document.getElementById("monthSales");
const staffCount = document.getElementById("staffCount");

// staff count
staffCount.textContent = staffData.length;


// ============================
// CALCULATE YEAR DATA
// ============================

let totalRevenue = 0;

const monthlyRevenue = [];
const monthlyTickets = [];

months.forEach((m,i)=>{

const key = `${year}-${String(i+1).padStart(2,"0")}`;

const month = SalesData[key] || {};

let revenue = 0;
let tickets = 0;

Object.values(month).forEach(day=>{

const dayRevenue =
(day.parkingCash||0)+
(day.parkingBank||0)+
(day.etagCash||0)+
(day.etagBank||0);

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

const revenueCtx =
document.getElementById("monthlyRevenueChart").getContext("2d");

new Chart(revenueCtx,{
type:"bar",

data:{
labels:months,

datasets:[{
label:"Monthly Revenue",
data:monthlyRevenue,
backgroundColor:"#6366f1",
borderRadius:6,
hoverBackgroundColor:"#4f46e5"
}]
},

options:{
responsive:true,

plugins:{
legend:{display:false}
},

scales:{
y:{
beginAtZero:true,
grid:{color:"#eee"}
},
x:{
grid:{display:false}
}
},

animation:{
duration:1200,
easing:"easeOutQuart"
}

}

});


// ============================
// TICKET DISTRIBUTION CHART
// ============================

const ticketCtx =
document.getElementById("ticketDistributionChart").getContext("2d");

new Chart(ticketCtx,{
type:"doughnut",

data:{
labels:months,

datasets:[{
data:monthlyTickets,

backgroundColor:[
"#3b82f6",
"#10b981",
"#f59e0b",
"#ef4444",
"#6366f1",
"#8b5cf6",
"#14b8a6",
"#22c55e",
"#f97316",
"#eab308",
"#06b6d4",
"#a855f7"
],

borderWidth:0
}]
},

options:{

cutout:"65%",

plugins:{
legend:{position:"bottom"}
},

animation:{
animateRotate:true,
duration:1500
}

}

});

});

// Check if user has visited before
if (!localStorage.getItem('parkflowVisited')) {
  // Create overlay
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
    opacity: '0',
    transition: 'opacity 0.5s ease'
  });
  
  // Create modal content
  const content = document.createElement('div');
  Object.assign(content.style, {
    background: 'linear-gradient(135deg, #87CEFA, #00BFFF)',
    padding: '30px 40px',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '400px',
    width: '80%',
    transform: 'scale(0.7)',
    transition: 'transform 0.5s ease'
  });

  // Add header
  const header = document.createElement('h2');
  header.textContent = 'Welcome to ParkFlow!';
  Object.assign(header.style, {
    marginBottom: '15px',
    fontSize: '1.8em',
    textShadow: '1px 1px 3px rgba(0,0,0,0.2)'
  });
  
  // Add paragraph
  const paragraph = document.createElement('p');
  paragraph.innerHTML = 'Sales are simplified.<br>Data is re-uploaded twice a month: 1st and 16th.<br>Explore!';
  Object.assign(paragraph.style, {
    marginBottom: '25px',
    fontSize: '1.1em',
    lineHeight: '1.4'
  });

  // Add button
  const button = document.createElement('button');
  button.textContent = 'Okay';
  Object.assign(button.style, {
    padding: '10px 25px',
    border: 'none',
    borderRadius: '50px',
    background: 'rgba(255,255,255,0.9)',
    color: '#00BFFF',
    fontWeight: 'bold',
    fontSize: '1em',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s'
  });
  
  // Button hover effect
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.background = 'rgba(255,255,255,1)';
  });
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.background = 'rgba(255,255,255,0.9)';
  });

  // Button click hides modal and sets localStorage
  button.addEventListener('click', () => {
    modal.style.opacity = '0';
    content.style.transform = 'scale(0.7)';
    setTimeout(() => {
      modal.remove();
      localStorage.setItem('parkflowVisited', 'true');
    }, 500);
  });

  // Assemble modal
  content.appendChild(header);
  content.appendChild(paragraph);
  content.appendChild(button);
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Animate modal in
  setTimeout(() => {
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 50);
}