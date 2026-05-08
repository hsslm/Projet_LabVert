// LabVert Dashboard

// API URL - Utilise l'API déployée sur le cloud
const API_URL = "https://projet-labvert.onrender.com";

// IP de l'ESP32 sur le réseau local - mettre l'IP affichée dans le Serial Monitor
const ESP32_URL = "http://172.20.10.2";

// Relaie la commande de la pompe vers l'ESP32
app.post('/pompe', async (req, res) => {
  try {
    const response = await fetch(`${ESP32_URL}/pompe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ erreur: "ESP32 inaccessible" });
  }
});

// Récupère le nom et sauvegarde 
const nomPlante = localStorage.getItem("planteNom");
const typePlante = localStorage.getItem("planteType");
document.getElementById("plantTitle").textContent = nomPlante || "LabVert";
document.getElementById("plantDisplayName").textContent = nomPlante || "Ma Plante";
document.getElementById("plantNickname").textContent = typePlante || "LabVert";

// Statut connexion
function setStatut(enLigne) {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  
  if (dot) {
    if (enLigne) {
      dot.style.background = '#52b788';
    } else {
      dot.style.background = '#e57373';
    }
  }
  
  if (text) {
    if (enLigne) {
      text.textContent = 'En ligne';
    } else {
      text.textContent = 'Hors ligne';
    }
  }
}

// Graphiques
const ctxTemp = document.getElementById('chartTemp').getContext('2d');
const ctxHum  = document.getElementById('chartHum').getContext('2d');

const chartTemp = new Chart(ctxTemp, {
  type: 'line',// en courbe
  data: {
    labels: [],//x=heures
    //courbe dans le graphique
    datasets: [{
      label: 'Température (°C)',
      data: [],
      borderColor: '#2e7d32',
      backgroundColor: 'rgba(46,125,50,0.10)',
      tension: 0.4,//rend la courbe arrondie
      fill: true,//remplit la zone sous la courbe
      pointRadius: 3//la taille des petits points sur la courbe
    }]
  },
  options: {
    responsive: true,//graphique s'adapte à la taille de l'écran
     plugins: { legend: { display: false } },
    scales: { 
      y: { title: { display: true, text: '°C' } } },//Titre axe de Y
      x: { title: { display: true, text: 'Temps' } } // Titre axe X
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
    scales: {
       y: { title: { display: true, text: '%' }, min: 0, max: 100 } },
       x: { title: { display: true, text: 'Temps' } } // Titre axe X
  }
});

// fonction pr évaluer état plante
function evaluerEtat(temperature, humidity) {
  const sol = document.getElementById('solEtat');
  const humNiv = document.getElementById('humNiveau');
  const tempStat = document.getElementById('tempStatut');

  if (sol) sol.textContent = humidity < 30 ? 'Sec' : humidity < 60 ? 'Humide' : 'Très humide';
  if (humNiv) humNiv.textContent = humidity < 30 ? 'Faible' : humidity < 60 ? 'Normal' : 'Élevé';
  if (tempStat) tempStat.textContent = temperature < 15 ? 'Froid' : temperature < 28 ? 'Optimal' : 'Chaud';
}

// fonction pr les conseils de l'IA
function chargerConseils(plante, temperature, humidity) {
  const conseilsPanel = document.getElementById('conseilsTexte');
  if (!conseilsPanel) return;

  conseilsPanel.textContent = "Chargement des conseils...";
//Envoie requête au serveur
  fetch(`${API_URL}/conseils?plante=${encodeURIComponent(plante)}&temperature=${temperature}&humidity=${humidity}`)
    .then(r => r.json())//convertit la réponse en JS
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

// focntion pour les statistiques
function chargerStats() {
  fetch(`${API_URL}/stats/`)//requête pour chercher les stats
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;
      chartTemp.data.labels = data.labels;//met les heures sur l'axe X du graphique température
      chartTemp.data.datasets[0].data = data.temperature.historique.map(Number);//met les valeurs de température dans la courbe+ map=convertit valeur en nbr
      chartTemp.update();//redessine le graphique avec les nouvelles données
      //pareil mais pour le graphique d'humidité
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
      evaluerEtat(tempLocale, humLocale);//appelle la fonction pour mettre à jour l'état de la plante avec ces valeurs
    })
    .catch(() => console.log("Erreur stats"));
}

// Dernières valeurs
let conseillsChargés = false;
let dernierTemp = null;
let dernierHum = null;

function mettreAJour() {
  fetch(`${API_URL}/latest/`)//chercher les dernières valeurs du capteur
    .then(r => r.json())
    .then(data => {
      if (data.erreur) { setStatut(false); return; }
      setStatut(true);
      //Sauvegarde la dernière température et humidité
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
  const input = document.getElementById('chatInput');//L'utilisateur tape un message
  const messages = document.getElementById('chatMessages');//affiche son message à droite
  // Récup msg, stop si vide
  const message = input.value.trim();
  if (!message) return;

  //Crée une nouvelle boîte HTML  msg
  const msgUser = document.createElement('div');
  msgUser.className = 'chat-msg user';
  msgUser.textContent = message;// met le message dans la bulle
  messages.appendChild(msgUser);
  input.value = '';//Vide le champ de texte après l'envoi
  messages.scrollTop = messages.scrollHeight;// Scroll en bas

  //Crée une nouvelle boîte HTML  ia
  const loading = document.createElement('div');
  loading.className = 'chat-msg bot';
  loading.textContent = '...';
  messages.appendChild(loading);
  messages.scrollTop = messages.scrollHeight;

  // Envoi au serveur
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
// Clic bouton → envoie msg
document.getElementById('chatSend').addEventListener('click', envoyerMessage);
// Touche Entrée → envoie msg
document.getElementById('chatInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') envoyerMessage();
});

// ── CONTRÔLE DE LA POMPE ──

// Envoie la commande au backend qui relaie à l'ESP32
function envoyerCommandePompe(pompe, auto_mode) {
  fetch(`${API_URL}/pompe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pompe: pompe, auto: auto_mode })
  }).catch(() => console.log("Erreur commande pompe"));
}

// écoute si l'utilisateur change le toggle auto
document.getElementById('toggleAuto').addEventListener('change', function() {
  
  //  prend le toggle manuel
  const pompe = document.getElementById('togglePompe');
  
  // Si auto est activé = bloque le manuel
  pompe.disabled = this.checked;
  
  // On grise le manuel pour montrer qu'il est bloqué
  if (this.checked) {
    pompe.parentElement.style.opacity = '0.4'; // grisé
    pompe.checked = false; // désactive le toggle manuel
    envoyerCommandePompe(false, true); // active mode auto sur l'ESP32
  } else {
    pompe.parentElement.style.opacity = '1'; // normal
    envoyerCommandePompe(false, false); // désactive mode auto sur l'ESP32
  }
});

// Si l'utilisateur essaie de cliquer sur manuel quand auto est activé
// on annule le clic
document.getElementById('togglePompe').addEventListener('change', function() {
  if (document.getElementById('toggleAuto').checked) return; // bloqué si auto actif
  // Envoie la commande à l'ESP32 selon l'état du toggle
  envoyerCommandePompe(this.checked, false);
});