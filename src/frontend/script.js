document.addEventListener("DOMContentLoaded", () => {

  function updateData() {
    fetch("/data")
      .then(r => r.json())
      .then(d => {
        document.getElementById("temp").innerText = d.temperature + " °C";
        document.getElementById("hum").innerText = d.humidity + " %";
      })
      .catch(err => console.log("Erreur:", err));
  }

  updateData();
  setInterval(updateData, 5000);

  // MENU ARROSAGE
  function toggleArrosageMenu() {
    const menu = document.getElementById("arrosageMenu");
    menu.classList.toggle("hidden");
  }
  window.toggleArrosageMenu = toggleArrosageMenu; // important pour l'appel depuis HTML

  // BOUTONS ON / OFF
  document.getElementById("autoOn").addEventListener("click", () => {
    console.log("Arrosage automatique : ON");
  });

  document.getElementById("autoOff").addEventListener("click", () => {
    console.log("Arrosage automatique : OFF");
  });
  // FONCTION POUR LES MINI-SECTIONS
  function toggleSection(id) {
    const box = document.getElementById(id);
    box.classList.toggle("hidden");
  }
  window.toggleSection = toggleSection;

  // BOUTONS ON / OFF
  document.getElementById("autoOn").addEventListener("click", () => {
    console.log("lol");
  });

  document.getElementById("autoOff").addEventListener("click", () => {
    console.log("lol");
  });

});
