
const nomPlante = localStorage.getItem("planteNom");
document.getElementById("plantTitle").textContent = nomPlante;

console.log("Plante sélectionnée :", nomPlante);

// ── GRAPHIQUE PRINCIPAL ──
const ctx = document.getElementById('monGraphique').getContext('2d');

let monChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Température (°C)',
        data: [],
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46,125,50,0.08)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Humidité (%)',
        data: [],
        borderColor: '#81c784',
        backgroundColor: 'rgba(129,199,132,0.08)',
        tension: 0.4,
        fill: true
      }
    ]
  },
  options: { responsive: true }
});

// ── CHARGER LES STATISTIQUES ──
function chargerStats() {
  fetch('http://172.20.10.3:3000/stats/')
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;

      monChart.data.labels = data.labels;
      monChart.data.datasets[0].data = data.temperature.historique.map(Number);
      monChart.data.datasets[1].data = data.humidite.historique.map(Number);
      monChart.update();

      document.querySelector('#statTemp .stat-val').textContent = data.temperature.mediane + '°C';
      document.querySelector('#statHum .stat-val').textContent = data.humidite.mediane + '%';

      document.getElementById('statTemp').onclick = () =>
        ouvrirModal(
          'Température',
          data.temperature.mediane,
          data.temperature.minimum,
          data.temperature.maximum,
          data.temperature.moyenne
        );

      document.getElementById('statHum').onclick = () =>
        ouvrirModal(
          'Humidité',
          data.humidite.mediane,
          data.humidite.minimum,
          data.humidite.maximum,
          data.humidite.moyenne
        );
    })
    .catch(() => {
      document.querySelector('#statTemp .stat-val').textContent = '--°C';
      document.querySelector('#statHum .stat-val').textContent = '--%';

      document.getElementById('statTemp').onclick = () =>
        ouvrirModal('Température', '--', '--', '--', '--');
      document.getElementById('statHum').onclick = () =>
        ouvrirModal('Humidité', '--', '--', '--', '--');
    });
}

// ── MISE À JOUR TEMPÉRATURE ET HUMIDITÉ EN TEMPS RÉEL ──
function mettreAJour() {
  fetch('http://172.20.10.3:3000/latest/')
    .then(r => r.json())
    .then(data => {
      if (data.erreur) return;

      const temp = parseFloat(data.temperature);
      const hum = parseFloat(data.humidity);

      document.getElementById('tempVal').innerHTML = temp + '<span class="sensor-unit">°C</span>';
      document.getElementById('humVal').innerHTML = hum + '<span class="sensor-unit">%</span>';

      verifierConditions(temp, hum);
    })
    .catch(() => {
      document.getElementById('tempVal').innerHTML = '--°C';
      document.getElementById('humVal').innerHTML = '--%';
    });
}

// ── MODE AUTO/MANUEL ──
function toggleMode(el) {
  const pompe = document.getElementById('togglePompe');
  pompe.disabled = el.checked;
  pompe.parentElement.style.opacity = el.checked ? '0.4' : '1';
}

// ── BOUTON ARROSER MAINTENANT ──
function arroserMaintenant() {
  const btn = document.querySelector('.arroser-btn');
  btn.textContent = 'Arrosage en cours...';
  btn.style.background = 'rgba(105,240,174,0.2)';
  btn.style.borderColor = '#69f0ae';
  setTimeout(() => {
    btn.textContent = 'Arroser maintenant';
    btn.style.background = '';
    btn.style.borderColor = '';
  }, 3000);
}

// ── POPUP STATISTIQUES ──
let modalChart = null;

function ouvrirModal(nom, mediane, min, max, moyenne) {
  document.getElementById('modalTitre').textContent = nom;
  document.getElementById('modalMediane').textContent = mediane;
  document.getElementById('modalMoyenne').textContent = moyenne;
  document.getElementById('modalMin').textContent = min;
  document.getElementById('modalMax').textContent = max;
  document.getElementById('modalOverlay').classList.add('open');

  if (modalChart) modalChart.destroy();

  const ctx2 = document.getElementById('modalGraphique').getContext('2d');
  modalChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: ['Min', 'Médiane', 'Moyenne', 'Max'],
      datasets: [{
        data: [min, mediane, moyenne, max],
        backgroundColor: ['#c8e6c9', '#81c784', '#4caf50', '#2e7d32'],
        borderRadius: 8
      }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}

function fermerModal(e) {
  if (e.target === document.getElementById('modalOverlay')) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}

// ── INFORMATIONS PLANTE ──
const apiKey = "sk-ZnU069c6c20d90c8d15861";
let besoinsPlante = null;

function chargerInfosPlante() {
  if (!nomPlante) return;

  fetch(`https://perenual.com/api/v2/species-list?key=${apiKey}&q=${nomPlante}`)
    .then(r => r.json())
    .then(data => {
      if (!data.data || data.data.length === 0) return;
      besoinsPlante = data.data[0];
      console.log("Besoins de la plante :", besoinsPlante);
    })
    .catch(err => console.error("Erreur API plante", err));
}

// ── VÉRIFIER CONDITIONS TEMP/HUM ──
function verifierConditions(temp, hum) {
  if (!besoinsPlante) return;

  const besoinEau = besoinsPlante.watering;

  if (hum < 40) {
    console.log("Sol trop sec pour", nomPlante);
    document.body.style.background = "#ffebee";
  } else {
    document.body.style.background = "#f1f8f1";
  }
}

// ── LANCEMENT AU CHARGEMENT ──
chargerStats();
mettreAJour();
chargerInfosPlante();

// Répète toutes les 5 sec pour les valeurs et toutes les 30 sec pour les stats
setInterval(mettreAJour, 5000);
setInterval(chargerStats, 30000);