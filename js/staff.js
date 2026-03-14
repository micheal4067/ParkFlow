import { staffData } from "../data/data.js";

// Load staff cards
const staffList = document.getElementById("staffList");

staffData.forEach(staff => {
    const card = document.createElement("div");
    card.classList.add("staff-card");
    card.innerHTML = `
        <img src="${staff.profile}" alt="${staff.name}">
        <h3>${staff.name}</h3>
        <p>${staff.position}</p>
        <p>${staff.post}</p>
        <p>Started: ${staff.startDate}</p>
    `;
    card.addEventListener("click", () => openModal(staff));
    staffList.appendChild(card);
});

// Modal functions
const modal = document.getElementById("staffModal");
const modalBody = document.getElementById("modalBody");

function openModal(staff) {
    modalBody.innerHTML = `
        <img src="${staff.profile}" alt="${staff.name}">
        <h2>${staff.name}</h2>
        <p><strong>Position:</strong> ${staff.position}</p>
        <p><strong>Post:</strong> ${staff.post}</p>
        <p><strong>Start Date:</strong> ${staff.startDate}</p>
        <p><strong>Contact:</strong> ${staff.contact}</p>
        <p><strong>Email:</strong> ${staff.email}</p>
    `;
    modal.classList.add("active"); 
}

function closeModal() {
    modal.classList.remove("active"); 
}

document.querySelector('.close-btn').addEventListener('click', ()=>{
    closeModal();
})