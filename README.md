# Projet_LabVert - Automatic Plant Watering System / Système d'Arrosage Automatique pour Plantes

NOTE : English version follows below / NOTE : Version anglaise ci-dessous

---
---
---

# Projet_LabVert - Système d'Arrosage Automatique pour Plantes

Un système IoT complet qui surveille et arrose automatiquement vos plantes en temps réel.

## Demo en Direct

Site en production : https://projet-lab-vert.vercel.app/

Accédez directement au tableau de bord live pour voir les données en temps réel, consulter l'historique des capteurs, recevoir des conseils de l'IA intégrée et discuter avec celle-ci.

---

## Caractéristiques Principales

- Surveillance en temps réel (capteur DHT11 : température + humidité)
- Tableau de bord web interactif avec graphiques historiques
- Stockage cloud des données (MongoDB Atlas)
- Assistant IA intégré (Groq AI) qui donne des conseils sur l'arrosage et l'état des plantes
- Boite de conversation en direct pour discuter de l'état des plantes
- Contrôle automatisé de la pompe d'arrosage
- Tunnel ngrok pour la communication ESP32 sécurisée
- Déployé et accessible 24/7 en ligne

---

## Stack Technologique

Hardware :
- ESP32 30 pins microcontrôleur WiFi
- Capteur DHT11 (température et humidité)
- Module relais 5V 2 canaux avec optoisolation (permet à l'ESP32 de contrôler l'activation/désactivation de la pompe 12V)
- Pompe submersible 12V DC (débit 600-1000 L/h)
- Adaptateur alimentation 12V 2A pour pompe
- Câbles de connexion Dupont et connecteurs
- Tubes de silicone pour l'eau

Backend :
- Node.js + Express.js
- MongoDB Atlas (base de données cloud)
- Groq AI (assistant IA pour les conseils)
- Déployé sur Render.com

Frontend :
- HTML5 + CSS3 + JavaScript
- Chart.js pour les graphiques
- Boite de conversation interactive
- Déployé sur Vercel

---

## Architecture simplifiée

Capteur DHT11 → ESP32 → Tunnel Ngrok → API Render → MongoDB → Frontend Vercel
                                               ↓
                                  Dashboard Live + Assistant IA
                                               ↓
                                    Module Relais → Pompe 12V

---

## Diagramme UML Architecture

![LabVert Architecture UML](./docs/labvert-uml-diagram.png)

Le système est organisé en plusieurs modules :
- Frontend : PageSetup, Dashboard, LocalStorage pour gestion de l'interface
- Backend API : API_Node5 pour les endpoints REST, gestion des données
- Base de données : BaseDeDonnees pour stockage des mesures
- IA : Module IA pour générer les conseils via Groq
- Hardware : ESP32 pour capteurs et contrôle de la pompe
- Robotique : Relais et DHT11 pour l'exécution

---

## Photos du Prototype

### Montage Complet

![Prototype Montage 1](./docs/prototype-montage-1.jpg)

![Prototype Montage 2](./docs/prototype-montage-2.jpg)

Voici le prototype fonctionnel du système Projet_LabVert avec :
- ESP32 sur breadboard avec tous les fils de connexion
- DHT11 connecté à droite pour la mesure température/humidité
- Relais 5V pour contrôler la pompe 12V
- Pompe submersible 12V prête à fonctionner
- Câblage complet : rouge (alimentation 5V/12V), noir (GND), jaune et bleu (signaux GPIO)
- Adaptateur 12V branché pour l'alimentation de la pompe

---

## Installation Locale (Développement)

### Backend (Node.js)

cd src/LabVert-API
npm install

Créer un fichier .env :
cp .env.example .env

Remplir avec vos identifiants MongoDB Atlas et Groq AI :
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/LabVert
PORT=3000
GROQ_API_KEY=votre_clé_groq_api

npm start

Le serveur écoute sur http://localhost:3000

### Frontend

cd src/frontend

Option A : Ouvrir index.html dans le navigateur
Option B : Serveur local
npx http-server

Accédez à http://localhost:3000/frontend/ ou http://localhost:8080

### ESP32 (Firmware avec Ngrok)

- Installer PlatformIO dans VS Code
- Ouvrir le projet dans PlatformIO
- Installer ngrok : https://ngrok.com/download

Câblage matériel :

ESP32 (30 pins)          →  DHT11
GPIO4                    →  Data pin
3.3V                     →  VCC
GND                      →  GND

ESP32                    →  Module Relais 5V
GPIO5                    →  IN1 (pour pompe)
5V                       →  VCC
GND                      →  GND

Module Relais            →  Pompe 12V
COM                      →  Négatif pompe
NC (Normally Close)      →  Positif pompe via adaptateur 12V

Adaptateur 12V           →  Pompe submersible
Positif (rouge)          →  Positif pompe
Négatif (noir)           →  Négatif pompe

Éditer src/backend/main.cpp :

const char* ssid = "VOTRE_WIFI";
const char* password = "VOTRE_PASSWORD";
const char* apiUrl = "https://votre_ngrok_url/data";

#define DHTPIN 4
#define RELAYPIN 5

- Compiler et uploader sur l'ESP32

Démarrer le tunnel Ngrok :
ngrok http 3000

Cela vous donnera une URL publique du type : https://xxxx-xxxx-xxxx.ngrok.io

Utiliser cette URL dans le code ESP32 pour apiUrl.

---

## Configuration MongoDB Atlas

1. Créer un compte gratuit : https://www.mongodb.com/cloud/atlas
2. Créer un cluster
3. Créer un utilisateur de base de données
4. Obtenir la chaîne de connexion (URI)
5. Ajouter dans .env :

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/LabVert

---

## Configuration Groq AI

1. Créer un compte : https://console.groq.com
2. Obtenir votre clé API
3. Ajouter dans .env :

GROQ_API_KEY=votre_clé_api_groq

L'assistant IA utilise le modèle Groq pour analyser l'état des plantes et fournir des conseils.

---

## Documentation API

Adresse API en production : https://projet-labvert.onrender.com

### POST /data
Reçoit les lectures du capteur (depuis ESP32)

curl -X POST https://projet-labvert.onrender.com/data \
  -H "Content-Type: application/json" \
  -d '{"temperature": 23.5, "humidity": 65}'

### GET /latest/
Récupère la dernière mesure

curl https://projet-labvert.onrender.com/latest/

### GET /stats/
Statistiques sur les 50 dernières mesures

curl https://projet-labvert.onrender.com/stats/

### GET /plantes
Liste des espèces de plantes

curl https://projet-labvert.onrender.com/plantes

### POST /chat
Envoie un message à l'assistant IA

curl -X POST https://projet-labvert.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Comment bien arroser mon monstera?"}'

### POST /pump/control
Contrôle la pompe d'arrosage

curl -X POST https://projet-labvert.onrender.com/pump/control \
  -H "Content-Type: application/json" \
  -d '{"action": "on", "duration": 10}'

---

## Déploiement en Production

### Backend - Render.com

1. Créer un compte : https://render.com
2. Ajouter un nouveau "Web Service"
3. Connecter votre repository GitHub
4. Variables d'environnement :

MONGO_URI=mongodb+srv://...
PORT=3000
CORS_ORIGIN=https://projet-lab-vert.vercel.app
GROQ_API_KEY=votre_clé_api_groq

5. Déployer

### Frontend - Vercel

1. Créer un compte : https://vercel.com
2. Importer le projet GitHub
3. Configuration :
   - Framework : Static
   - Root Directory : src/frontend
4. Déployer

Après déploiement, mettre à jour l'URL API dans index.js :

const API_URL = 'https://projet-labvert.onrender.com';

---

## Configuration Ngrok en Production

Pour l'ESP32, utiliser le tunnel Ngrok ou directement l'URL de l'API Render :

Option 1 - Ngrok (développement) :
const char* apiUrl = "https://votre_tunnel_ngrok.ngrok.io/data";

Option 2 - URL directe (production) :
const char* apiUrl = "https://projet-labvert.onrender.com/data";

---

## Base de Données

MongoDB Collection : mesures

{
  "_id": ObjectId,
  "temperature": 23.5,
  "humidity": 65.0,
  "date": "2026-05-17T14:30:00Z"
}

Les données s'accumulent continuellement. Consulter/gérer via MongoDB Atlas Dashboard.

---

## Assistant IA et Conversation

### Assistant IA (Groq AI)

L'assistant IA intégré analyse l'état de vos plantes en temps réel et fournit des conseils :
- Recommandations d'arrosage basées sur température et humidité
- Détection de problèmes potentiels
- Conseils de maintenance des plantes
- Réponses à vos questions sur le jardinage

L'assistant s'actualise automatiquement avec les nouvelles données des capteurs.

### Boite de Conversation

La boite de conversation permet de :
- Poser des questions à l'assistant IA
- Recevoir des conseils personnalisés
- Discuter de l'état spécifique de vos plantes
- Consigner l'historique des interactions

Les messages sont traités via Groq AI et affichés en temps réel.

---

## Contrôle de la Pompe

### Mode Automatique

La pompe s'active automatiquement quand l'humidité descend en dessous du seuil défini pour la plante.

Seuils par défaut :
- Monstera : 50% humidité (activation) - 70% (désactivation)
- Pothos : 40% humidité (activation) - 60% (désactivation)

### Mode Manuel

Contrôle direct via le tableau de bord pour arroser à la demande.

Durée d'arrosage : 5-15 secondes (configurable)

---

## Structure des Fichiers

Projet_LabVert/
├── src/
│   ├── backend/main.cpp              # Firmware ESP32
│   ├── LabVert-API/
│   │   ├── server.js                 # API Express
│   │   ├── package.json
│   │   └── .env                      # Secrets (à créer)
│   └── frontend/
│       ├── index.html                # Dashboard
│       ├── index.js                  # Logique
│       ├── script.js                 # Graphiques
│       ├── chat.js                   # Conversation IA
│       └── index.css                 # Styling
├── docs/
│   ├── labvert-uml-diagram.png       # Diagramme UML
│   ├── prototype-montage-1.jpg       # Photo prototype 1
│   └── prototype-montage-2.jpg       # Photo prototype 2
├── platformio.ini                    # Config ESP32
├── .env.example                      # Template .env
└── README.md

---

## Dépannage Rapide

Backend n'est pas accessible
- Vérifier que le serveur tourne : npm start
- Vérifier le port : PORT=3000 dans .env
- Vérifier CORS : CORS_ORIGIN=http://localhost:3000 pour dev local

MongoDB connexion échoue
- Vérifier MONGO_URI dans .env
- Vérifier l'IP est whitelistée (MongoDB Atlas > Network Access > 0.0.0.0/0 pour dev)
- Vérifier la connexion internet

ESP32 n'envoie pas de données (avec Ngrok)
- Vérifier que ngrok tourne : ngrok http 3000
- Vérifier l'URL Ngrok est mise à jour dans main.cpp
- Vérifier WiFi : SSID et password dans main.cpp
- Vérifier le capteur DHT11 est bien branché
- Vérifier le câblage GPIO4 (DHT11 data)

Pompe ne s'active pas
- Vérifier le câblage du relais (GPIO5)
- Vérifier l'adaptateur 12V est branché
- Vérifier la pompe fonctionne (tester hors système)
- Vérifier l'humidité est en dessous du seuil
- Vérifier que le relais est en état activé dans le code

Assistant IA ne répond pas
- Vérifier que GROQ_API_KEY est définie dans .env
- Vérifier votre quota API Groq
- Vérifier que la clé API est valide

Frontend n'affiche pas les données
- Vérifier que l'API tourne
- Vérifier API_URL dans index.js pointe vers le bon serveur
- Ouvrir la console du navigateur (F12) pour voir les erreurs

---

## Sécurité

En développement :
- WiFi credentials en dur dans le code (à améliorer)
- Pas d'authentification API
- Ngrok expose l'API localement (à protéger en production)

En production (Render + Vercel) :
- Variables d'environnement sécurisées
- HTTPS/SSL activé
- MongoDB authentifiée
- Clés API sécurisées (Groq)

---

## Prochaines Étapes

- Implémenter authentification utilisateur
- Ajouter notifications par email/SMS
- Capteur d'humidité du sol (en plus de l'air)
- App mobile

---

## Auteurs

Selma Hajjami
Douaa Bouhlal
Abyan Rahima Elmi

---

## Support

Email : hajjamiselma@outlook.com
Issues : Signaler un bug
GitHub : Contributions bienvenues

---

Démarrer maintenant : https://projet-lab-vert.vercel.app/

---
---
---

# Projet_LabVert - Automatic Plant Watering System

A complete IoT system that monitors and automatically waters your plants in real time.

## Live Demo

Production site : https://projet-lab-vert.vercel.app/

Access the live dashboard directly to see real-time data, check sensor history, get advice from the integrated AI assistant, and chat with it.

---

## Main Features

- Real-time monitoring (DHT11 sensor : temperature + humidity)
- Interactive web dashboard with historical charts
- Cloud data storage (MongoDB Atlas)
- Integrated AI assistant (Groq AI) that provides advice on watering and plant status
- Live chat box to discuss plant status
- Automated watering pump control
- Ngrok tunnel for secure ESP32 communication
- Deployed and accessible 24/7 online

---

## Technology Stack

Hardware :
- ESP32 30 pins WiFi microcontroller
- DHT11 temperature and humidity sensor
- 5V relay module with 2 channels and optoisolation (allows ESP32 to control on/off activation of the 12V pump)
- 12V DC submersible pump (flow rate 600-1000 L/h)
- 12V 2A power adapter for pump
- Dupont connection cables and connectors
- Silicone tubes for water

Backend :
- Node.js + Express.js
- MongoDB Atlas (cloud database)
- Groq AI (AI assistant for advice)
- Deployed on Render.com

Frontend :
- HTML5 + CSS3 + JavaScript
- Chart.js for graphics
- Interactive chat box
- Deployed on Vercel

---

## Architecture

DHT11 Sensor → ESP32 → Ngrok Tunnel → Render API → MongoDB → Vercel Frontend
                                                  ↓
                                     Live Dashboard + AI Assistant
                                                  ↓
                                    Relay Module → 12V Pump

---

## UML Architecture Diagram

![LabVert Architecture UML](./docs/labvert-uml-diagram.png)

The system is organized into several modules:
- Frontend: PageSetup, Dashboard, LocalStorage for interface management
- Backend API: API_Node5 for REST endpoints, data management
- Database: BaseDeDonnees for measurements storage
- AI: IA module to generate advice via Groq
- Hardware: ESP32 for sensors and pump control
- Robotics: Relay and DHT11 for execution

---

## Prototype Photos

### Complete Assembly

![Prototype Assembly 1](./docs/prototype-montage-1.jpg)

![Prototype Assembly 2](./docs/prototype-montage-2.jpg)

Here is the functional prototype of the Projet_LabVert system with :
- ESP32 on breadboard with all connection wires
- DHT11 connected on right side for temperature/humidity measurement
- 5V relay to control 12V pump
- 12V submersible pump ready to operate
- Complete wiring: red (5V/12V power), black (GND), yellow and blue (GPIO signals)
- 12V adapter plugged in for pump power supply

---

## Local Installation (Development)

### Backend (Node.js)

cd src/LabVert-API
npm install

Create .env file :
cp .env.example .env

Fill with your MongoDB Atlas and Groq AI credentials :
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/LabVert
PORT=3000
GROQ_API_KEY=your_groq_api_key

npm start

Server listens on http://localhost:3000

### Frontend

cd src/frontend

Option A : Open index.html in browser
Option B : Local server
npx http-server

Access http://localhost:3000/frontend/ or http://localhost:8080

### ESP32 (Firmware with Ngrok)

- Install PlatformIO in VS Code
- Open project in PlatformIO
- Download ngrok : https://ngrok.com/download

Hardware wiring :

ESP32 (30 pins)          →  DHT11
GPIO4                    →  Data pin
3.3V                     →  VCC
GND                      →  GND

ESP32                    →  5V Relay Module
GPIO5                    →  IN1 (for pump)
5V                       →  VCC
GND                      →  GND

Relay Module             →  12V Submersible Pump
COM                      →  Pump negative
NC (Normally Close)      →  Pump positive via 12V adapter

12V Power Adapter        →  Submersible Pump
Positive (red)           →  Pump positive
Negative (black)         →  Pump negative

Edit src/backend/main.cpp :

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* apiUrl = "https://your_ngrok_url/data";

#define DHTPIN 4
#define RELAYPIN 5

- Compile and upload to ESP32

Start Ngrok tunnel :
ngrok http 3000

This will give you a public URL like : https://xxxx-xxxx-xxxx.ngrok.io

Use this URL in ESP32 code for apiUrl.

---

## MongoDB Atlas Configuration

1. Create free account : https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Get connection string (URI)
5. Add to .env :

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/LabVert

---

## Groq AI Configuration

1. Create account : https://console.groq.com
2. Get your API key
3. Add to .env :

GROQ_API_KEY=your_groq_api_key

The AI assistant uses Groq model to analyze plant status and provide advice.

---

## API Documentation

Production API address : https://projet-labvert.onrender.com

### POST /data
Receives sensor readings (from ESP32)

curl -X POST https://projet-labvert.onrender.com/data \
  -H "Content-Type: application/json" \
  -d '{"temperature": 23.5, "humidity": 65}'

### GET /latest/
Get latest sensor reading

curl https://projet-labvert.onrender.com/latest/

### GET /stats/
Statistics on last 50 measurements

curl https://projet-labvert.onrender.com/stats/

### GET /plantes
List of plant species

curl https://projet-labvert.onrender.com/plantes

### POST /chat
Send message to AI assistant

curl -X POST https://projet-labvert.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How should I water my monstera?"}'

### POST /pump/control
Control watering pump

curl -X POST https://projet-labvert.onrender.com/pump/control \
  -H "Content-Type: application/json" \
  -d '{"action": "on", "duration": 10}'

---

## Production Deployment

### Backend - Render.com

1. Create account : https://render.com
2. Add new "Web Service"
3. Connect your GitHub repository
4. Environment variables :

MONGO_URI=mongodb+srv://...
PORT=3000
CORS_ORIGIN=https://projet-lab-vert.vercel.app
GROQ_API_KEY=your_groq_api_key

5. Deploy

### Frontend - Vercel

1. Create account : https://vercel.com
2. Import GitHub project
3. Configuration :
   - Framework : Static
   - Root Directory : src/frontend
4. Deploy

After deployment, update API URL in index.js :

const API_URL = 'https://projet-labvert.onrender.com';

---

## Ngrok Configuration in Production

For ESP32, use Ngrok tunnel or directly the Render API URL :

Option 1 - Ngrok (development) :
const char* apiUrl = "https://your_ngrok_tunnel.ngrok.io/data";

Option 2 - Direct URL (production) :
const char* apiUrl = "https://projet-labvert.onrender.com/data";

---

## Database

MongoDB Collection : mesures

{
  "_id": ObjectId,
  "temperature": 23.5,
  "humidity": 65.0,
  "date": "2026-05-17T14:30:00Z"
}

Data accumulates continuously. View/manage via MongoDB Atlas Dashboard.

---

## AI Assistant and Chat

### AI Assistant (Groq AI)

The integrated AI assistant analyzes your plants in real time and provides advice :
- Watering recommendations based on temperature and humidity
- Detection of potential issues
- Plant maintenance tips
- Answers to your gardening questions

The assistant updates automatically with new sensor data.

### Chat Box

The chat box allows you to :
- Ask questions to the AI assistant
- Receive personalized advice
- Discuss your plants' specific status
- Keep history of interactions

Messages are processed via Groq AI and displayed in real time.

---

## Pump Control

### Automatic Mode

Pump activates automatically when humidity drops below the threshold for the plant.

Default thresholds :
- Monstera : 50% humidity (activation) - 70% (deactivation)
- Pothos : 40% humidity (activation) - 60% (deactivation)

### Manual Mode

Direct control via dashboard to water on demand.

Watering duration : 5-15 seconds (configurable)

---

## File Structure

Projet_LabVert/
├── src/
│   ├── backend/main.cpp              # ESP32 Firmware
│   ├── LabVert-API/
│   │   ├── server.js                 # Express API
│   │   ├── package.json
│   │   └── .env                      # Secrets (to create)
│   └── frontend/
│       ├── index.html                # Dashboard
│       ├── index.js                  # Logic
│       ├── script.js                 # Charts
│       ├── chat.js                   # AI Chat
│       └── index.css                 # Styling
├── docs/
│   ├── labvert-uml-diagram.png       # UML Diagram
│   ├── prototype-montage-1.jpg       # Prototype photo 1
│   └── prototype-montage-2.jpg       # Prototype photo 2
├── platformio.ini                    # ESP32 Config
├── .env.example                      # .env Template
└── README.md

---

## Quick Troubleshooting

Backend not accessible
- Check server is running : npm start
- Check port : PORT=3000 in .env
- Check CORS : CORS_ORIGIN=http://localhost:3000 for local dev

MongoDB connection fails
- Verify MONGO_URI in .env
- Check IP is whitelisted (MongoDB Atlas > Network Access > 0.0.0.0/0 for dev)
- Check internet connection

ESP32 not sending data (with Ngrok)
- Check ngrok is running : ngrok http 3000
- Verify Ngrok URL is updated in main.cpp
- Check WiFi : SSID and password in main.cpp
- Check DHT11 sensor is properly connected
- Verify GPIO4 wiring (DHT11 data)

Pump not activating
- Check relay wiring (GPIO5)
- Check 12V power adapter is plugged in
- Test pump outside system (check if it works)
- Check humidity is below threshold
- Verify relay is enabled in code

AI Assistant not responding
- Verify GROQ_API_KEY is set in .env
- Check your Groq API quota
- Verify the API key is valid

Frontend not displaying data
- Check API is running
- Check API_URL in index.js points to correct server
- Open browser console (F12) to see errors

---

## Security

In development :
- WiFi credentials hardcoded in code (to improve)
- No API authentication
- Ngrok exposes API locally (protect in production)

In production (Render + Vercel) :
- Secure environment variables
- HTTPS/SSL enabled
- MongoDB authenticated
- API keys secured (Groq)

---

## Next Steps

- Implement user authentication
- Add email/SMS notifications
- Soil humidity sensor (in addition to air)
- Mobile app

---

## Authors

Selma Hajjami
Douaa Bouhlal
Abyan Rahima Elmi

---

## Support

Email : hajjamiselma@outlook.com
Issues : Report a bug
GitHub : Contributions welcome

---

Get started now : https://projet-lab-vert.vercel.app/