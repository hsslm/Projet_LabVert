// LabVert Dashboard

// API URL - Utilise l'API déployée sur le cloud
const API_URL = "https://projet-labvert.onrender.com";

// Plante
const nomPlante = localStorage.getItem("planteNom");
const typePlante = localStorage.getItem("planteType");
document.getElementById("plantTitle").textContent = nomPlante || "LabVert";
document.getElementById("plantDisplayName").textContent = nomPlante || "Ma Plante";
document.getElementById("plantNickname").textContent = typePlante || "LabVert";

// Statut connexion
function setStatut(enLigne) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (dot) dot.style.background = enLigne ? '#52b788' : '#e57373';
  if (text) text.textContent = enLigne ? 'En ligne' : 'Hors ligne';
}

// Graphiques
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

// Évaluer état plante
function evaluerEtat(temperature, humidity) {
  const sol = document.getElementById('solEtat');
  const humNiv = document.getElementById('humNiveau');
  const tempStat = document.getElementById('tempStatut');

  if (sol) sol.textContent = humidity < 30 ? 'Sec' : humidity < 60 ? 'Humide' : 'Très humide';
  if (humNiv) humNiv.textContent = humidity < 30 ? 'Faible' : humidity < 60 ? 'Normal' : 'Élevé';
  if (tempStat) tempStat.textContent = temperature < 15 ? 'Froid' : temperature < 28 ? 'Optimal' : 'Chaud';
}

// Conseils IA
function chargerConseils(plante, temperature, humidity) {
  const conseilsPanel = document.getElementById('conseilsTexte');
  if (!conseilsPanel) return;

  conseilsPanel.textContent = "Chargement des conseils...";

  fetch(`${API_URL}/conseils?plante=${encodeURIComponent(plante)}&temperature=${temperature}&humidity=${humidity}`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) {
        conseilsPanel.textContent = "Impossible de charger les conseils.";
        return;
      }
      conseilsPanel.textContent = data.conseils;
    })
    .catch(() => {
      conseilsPanel.textContent = "Conseils non disponibles";
    });
}

// Stats
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

      const tempLocale = data.temperature.historique[data.temperature.historique.length - 1];
      const humLocale = data.humidite.historique[data.humidite.historique.length - 1];
      evaluerEtat(tempLocale, humLocale);
    })
    .catch(() => console.log("Erreur stats"));
}

// Dernières valeurs
let conseillsChargés = false;
let dernierTemp = null;
let dernierHum = null;

function mettreAJour() {
  fetch(`${API_URL}/latest/`)
    .then(r => r.json())
    .then(data => {
      if (data.erreur) { setStatut(false); return; }
      setStatut(true);
      dernierTemp = data.temperature;
      dernierHum = data.humidity;

      document.getElementById('tempVal').innerHTML = parseFloat(data.temperature) + '<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = parseFloat(data.humidity) + '<span class="sensor-unit">%</span>';

      evaluerEtat(data.temperature, data.humidity);

      const plante = localStorage.getItem("planteNom");
      if (plante && !conseillsChargés) {
        conseillsChargés = true;
        chargerConseils(plante, data.temperature, data.humidity);
      }
    })
    .catch(() => {
      setStatut(false);
      document.getElementById('tempVal').innerHTML = '--<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = '--<span class="sensor-unit">%</span>';
    });
}

chargerStats();
mettreAJour();
setInterval(mettreAJour, 5000);
setInterval(chargerStats, 30000);

// Chat IA

function envoyerMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  const message = input.value.trim();
  if (!message) return;

  const msgUser = document.createElement('div');
  msgUser.className = 'chat-msg user';
  msgUser.textContent = message;
  messages.appendChild(msgUser);
  input.value = '';
  messages.scrollTop = messages.scrollHeight;

  const loading = document.createElement('div');
  loading.className = 'chat-msg bot';
  loading.textContent = '...';
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      plante: localStorage.getItem("planteNom"),
      temperature: dernierTemp,
      humidity: dernierHum
    })
  })
    .then(r => r.json())
    .then(data => {
      loading.textContent = data.reponse || "Erreur de réponse";
      messages.scrollTop = messages.scrollHeight;
    })
    .catch(() => {
      loading.textContent = "Erreur de connexion";
    });
}

document.getElementById('chatSend').addEventListener('click', envoyerMessage);
document.getElementById('chatInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') envoyerMessage();
});