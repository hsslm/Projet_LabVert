
const API_URL = (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost")
  ? "http://127.0.0.1:3000"
  : "http://172.20.10.3:3000";

const nomPlante = localStorage.getItem("planteNom");
document.getElementById("plantTitle").textContent = nomPlante || "LabVert";

const ctxTemp = document.getElementById('chartTemp').getContext('2d');
const ctxHum  = document.getElementById('chartHum').getContext('2d');

const chartTemp = new Chart(ctxTemp, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Température (°C)',
      data: [],
      borderColor: '#2e7d32',
      backgroundColor: 'rgba(46,125,50,0.10)',
      tension: 0.4,
      fill: true,
      pointRadius: 3
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { title: { display: true, text: '°C' } } }
  }
});

const chartHum = new Chart(ctxHum, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Humidité (%)',
      data: [],
      borderColor: '#81c784',
      backgroundColor: 'rgba(129,199,132,0.10)',
      tension: 0.4,
      fill: true,
      pointRadius: 3
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { title: { display: true, text: '%' }, min: 0, max: 100 } }
  }
});

function chargerStats() {
  fetch(`${API_URL}/stats/`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;
      chartTemp.data.labels = data.labels;
      chartTemp.data.datasets[0].data = data.temperature.historique.map(Number);
      chartTemp.update();
      chartHum.data.labels = data.labels;
      chartHum.data.datasets[0].data = data.humidite.historique.map(Number);
      chartHum.update();
      document.getElementById('statTempMoy').textContent = data.temperature.moyenne + '°C';
      document.getElementById('statTempMed').textContent = data.temperature.mediane + '°C';
      document.getElementById('statTempMin').textContent = data.temperature.minimum + '°C';
      document.getElementById('statTempMax').textContent = data.temperature.maximum + '°C';
      document.getElementById('statHumMoy').textContent = data.humidite.moyenne + '%';
      document.getElementById('statHumMed').textContent = data.humidite.mediane + '%';
      document.getElementById('statHumMin').textContent = data.humidite.minimum + '%';
      document.getElementById('statHumMax').textContent = data.humidite.maximum + '%';

      // Évaluer l'état dynamique
      const dernierHum = data.humidite.historique[data.humidite.historique.length - 1];
      const dernierTemp = data.temperature.historique[data.temperature.historique.length - 1];
      if (typeof evaluerEtat === 'function') evaluerEtat(dernierHum, dernierTemp);
    });
}

function mettreAJour() {
  fetch(`${API_URL}/latest/`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;
      document.getElementById('tempVal').innerHTML = parseFloat(data.temperature) + '<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = parseFloat(data.humidity) + '<span class="sensor-unit">%</span>';
    })
    .catch(() => {
      document.getElementById('tempVal').innerHTML = '--<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = '--<span class="sensor-unit">%</span>';
    });
}

function toggleMode(el) {
  const pompe = document.getElementById('togglePompe');
  pompe.disabled = el.checked;
  pompe.parentElement.style.opacity = el.checked ? '0.4' : '1';
}

chargerStats();
mettreAJour();
setInterval(mettreAJour, 5000);
setInterval(chargerStats, 30000);