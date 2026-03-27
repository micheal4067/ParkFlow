import { etags } from "../data/salesdata.js";

let currentFilter = "all";

/* =========================
   GET STATUS
========================= */
function getStatus(etag) {
    const today = new Date();
    const expDate = new Date(etag.expires);
    const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (etag.tagId.toLowerCase() === "Not Issued") return "not-issued";
    if (diffDays < 0) return "expired";
    return "active";
}

/* =========================
   GET EXTRA TAGS (DUPLICATES)
========================= */
function getExtraTagNames(list) {
    const counts = {};
    const extras = new Set();

    list.forEach(tag => {
        const name = tag.name.trim().toLowerCase();

        counts[name] = (counts[name] || 0) + 1;

        if (counts[name] > 1) {
            extras.add(name);
        }
    });

    return extras;
}

/* =========================
   LOAD TABLE
========================= */
function loadETags(data) {

    const tbody = document.getElementById("etagBody");
    tbody.innerHTML = "";

    const extraNames = getExtraTagNames(data);

    data.forEach((etag, index) => {

        const today = new Date();
        const expDate = new Date(etag.expires);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        let status = getStatus(etag);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${etag.name}</td>
            <td>${etag.shopNo}</td>
            <td>${etag.tagId}</td>
            <td>${etag.activated}</td>
            <td>${etag.expires}</td>
            <td><span class="status ${status}">${status.toUpperCase()}</span></td>
            <td>${diffDays >= 0 ? diffDays + " days" : "Expired"}</td>
        `;

        tbody.appendChild(tr);
    });
}

/* =========================
   APPLY FILTER
========================= */
function applyFilter() {

    let filtered = [...etags];

    const extraNames = getExtraTagNames(etags);

    if (currentFilter === "active") {
        filtered = filtered.filter(tag => getStatus(tag) === "active");
    }

    else if (currentFilter === "expired") {
        filtered = filtered.filter(tag => getStatus(tag) === "expired");
    }

    else if (currentFilter === "not-issued") {
        filtered = filtered.filter(tag =>
            tag.tagId.toLowerCase() === "not issued"
        );
    }

    else if (currentFilter === "extra") {
        filtered = filtered.filter(tag =>
            extraNames.has(tag.name.trim().toLowerCase())
        );
    }

    loadETags(filtered);
}

/* =========================
   SEARCH + FILTER COMBINED
========================= */
document.getElementById("searchTag").addEventListener("input", e => {

    const query = e.target.value.toLowerCase();

    let filtered = etags.filter(etag =>
        etag.name.toLowerCase().includes(query) ||
        etag.shopNo.toLowerCase().includes(query)
    );

    const extraNames = getExtraTagNames(filtered);

    if (currentFilter === "active") {
        filtered = filtered.filter(tag => getStatus(tag) === "active");
    }

    else if (currentFilter === "expired") {
        filtered = filtered.filter(tag => getStatus(tag) === "expired");
    }

    else if (currentFilter === "not-issued") {
        filtered = filtered.filter(tag =>
            tag.name.toLowerCase() === "not issued"
        );
    }

    else if (currentFilter === "extra") {
        filtered = filtered.filter(tag =>
            extraNames.has(tag.name.trim().toLowerCase())
        );
    }

    loadETags(filtered);
});

/* =========================
   FILTER BUTTONS
========================= */
document.querySelectorAll(".filter-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        document.querySelectorAll(".filter-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        currentFilter = btn.dataset.filter;

        applyFilter();
    });

});

/* =========================
   INITIAL LOAD
========================= */
loadETags(etags);