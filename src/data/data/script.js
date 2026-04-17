document.addEventListener("DOMContentLoaded", () => {

  const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
    ? "http://127.0.0.1:3000"
    : "http://172.20.10.3:3000";

  function updateData() {
    fetch(`${API_URL}/latest/`)
      .then(r => r.json())
      .then(d => {
        document.getElementById("temp").innerText = d.temperature + " °C";
        document.getElementById("hum").innerText = d.humidity + " %";
      })
      .catch(err => console.log("Erreur:", err));
  }

  updateData();
  setInterval(updateData, 5000);

  function toggleArrosageMenu() {
    const menu = document.getElementById("arrosageMenu");
    menu.classList.toggle("hidden");
  }
  window.toggleArrosageMenu = toggleArrosageMenu;

  document.getElementById("autoOn").addEventListener("click", () => {
    console.log("Arrosage automatique : ON");
  });

  document.getElementById("autoOff").addEventListener("click", () => {
    console.log("Arrosage automatique : OFF");
  });

  function toggleSection(id) {
    const box = document.getElementById(id);
    box.classList.toggle("hidden");
  }
  window.toggleSection = toggleSection;

});