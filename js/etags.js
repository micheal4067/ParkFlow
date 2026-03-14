import { etags } from "../data/salesdata.js";

function loadETags(data) {
    const tbody = document.getElementById("etagBody");
    tbody.innerHTML = "";

    data.forEach(etag => {
        const today = new Date();
        const expDate = new Date(etag.expires);
        const diffTime = expDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let status = "";
        if (diffDays < 0) status = "expired";
        else if (diffDays <= 60) status = "expiring";
        else status = "active";

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${etag.name}</td>
            <td>${etag.shopNo}</td>
            <td>${etag.tagId}</td>
            <td>${etag.activated}</td>
            <td>${etag.expires}</td>
            <td><span class="status ${status}">${status.toUpperCase()}</span></td>
            <td class="days-left">${diffDays >= 0 ? diffDays + " days" : "Expired"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Search functionality
document.getElementById("searchTag").addEventListener("input", e => {
    const query = e.target.value.toLowerCase();
    const filtered = etags.filter(etag =>
        etag.name.toLowerCase().includes(query) ||
        etag.shopNo.toLowerCase().includes(query)
    );
    loadETags(filtered);
});

// Initial load
loadETags(etags);