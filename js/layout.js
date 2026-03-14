fetch("./components/sidebar.html")
.then(res => res.text())
.then(data => {
document.getElementById("sidebar-container").innerHTML = data;
});

function toggleMenu(){
document.getElementById("mobileMenu").classList.toggle("open");
}