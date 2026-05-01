// LabVert Dashboard

// API URL - Utilise l'API déployée sur le cloud
const API_URL = "https://projet-labvert.onrender.com";

const nomPlante = localStorage.getItem("planteNom");
const typePlante = localStorage.getItem("planteType");
document.getElementById("plantTitle").textContent = nomPlante || "LabVert";
document.getElementById("plantDisplayName").textContent = nomPlante || "Ma Plante";
document.getElementById("plantNickname").textContent = typePlante || "LabVert";

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

// Graphique de l'humidité
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

// Charge les stats et met à jour les graphiques
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

      const dernierHum = data.humidite.historique[data.humidite.historique.length - 1];
      const dernierTemp = data.temperature.historique[data.temperature.historique.length - 1];
      if (typeof evaluerEtat === 'function') evaluerEtat(dernierTemp, dernierHum);
    });
}

// Récupère et affiche les dernières valeurs
function mettreAJour() {
  fetch(`${API_URL}/latest/`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;
      document.getElementById('tempVal').innerHTML = parseFloat(data.temperature) + '<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = parseFloat(data.humidity) + '<span class="sensor-unit">%</span>';

      // Charger les conseils IA
      const plante = localStorage.getItem("planteNom");
      if (plante) {
        chargerConseils(plante, data.temperature, data.humidity);
      }
    })
    .catch(() => {
      document.getElementById('tempVal').innerHTML = '--<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = '--<span class="sensor-unit">%</span>';
    });
}

// Charge les conseils IA via Groq API
function chargerConseils(plante, temperature, humidity) {
  const conseilsPanel = document.getElementById('conseilsTexte');
  if (!conseilsPanel) return;

  fetch(`${API_URL}/conseils?plante=${encodeURIComponent(plante)}&temperature=${temperature}&humidity=${humidity}`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) {
        conseilsPanel.textContent = "Impossible de charger les conseils.";
        return;
      }
      conseilsPanel.textContent = data.conseils;
    })
    .catch(err => {
      console.error("Erreur conseils:", err);
      conseilsPanel.textContent = "Conseils non disponibles";
    });
}

// Désactiver mode manuel si mode auto activé
function toggleMode(el) {
  const pompe = document.getElementById('togglePompe');
  pompe.disabled = el.checked;
  pompe.parentElement.style.opacity = el.checked ? '0.4' : '1';
}

// Chargement initial
chargerStats();
mettreAJour();

// Évalue l'état de la plante basé sur température et humidité
function evaluerEtat(humidity, temperature) {
  const etatElement = document.getElementById('etatPlante');
  if (!etatElement) return;

  let etat = '✅ Bonne santé';
  let couleur = '#52b788'; // Vert

  // Vérifier l'humidité
  if (humidity < 30) {
    etat = '🏜️ Trop sec - Arroser !';
    couleur = '#d32f2f'; // Rouge
  } else if (humidity > 80) {
    etat = '💧 Trop humide';
    couleur = '#1976d2'; // Bleu
  }

  // Vérifier la température
  if (temperature < 5) {
    etat = '🥶 Trop froid';
    couleur = '#1976d2';
  } else if (temperature > 35) {
    etat = '🔥 Trop chaud';
    couleur = '#f57c00';
  }

  etatElement.textContent = etat;
  etatElement.style.color = couleur;
}

// Mise à jour continue
setInterval(mettreAJour, 5000);      // Chaque 5s
setInterval(chargerStats, 30000);    // Chaque 30s