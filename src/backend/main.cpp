// LabVert - Firmware ESP32
// Lit DHT11 et envoie données à l'API Node.js

#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <WebServer.h>

// Charger la configuration depuis config.h
#include "config.h"

// Utiliser les variables de config.h
const char* ssid = WIFI_SSID;
const char* motDePasse = WIFI_PASSWORD;
const char* apiUrl = API_URL;

DHT dht(DHTPIN, DHTTYPE);

// Serveur HTTP local sur l'ESP32 pour recevoir les commandes du frontend
WebServer server(80);

// Pins du L298N pour contrôler la pompe
#define ENA 26
#define IN1 27
#define IN2 14

// États de la pompe
bool modeAuto = false;
bool pompeActive = false;

// Timestamp de la dernière mesure envoyée
unsigned long dernierEnvoi = 0;

// Allume la pompe
void allumerPompe() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(ENA, HIGH);
  pompeActive = true;
  Serial.println("Pompe allumée");
}

// Éteint la pompe
void eteindrePompe() {
  digitalWrite(ENA, LOW);
  pompeActive = false;
  Serial.println("Pompe éteinte");
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Initialise les pins de la pompe
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  eteindrePompe(); // pompe éteinte au démarrage

  Serial.println("Connexion WiFi...");
  WiFi.begin(ssid, motDePasse);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP()); // affiche l'IP à mettre dans index.js

  // Gère la requête préliminaire CORS envoyée par le navigateur avant chaque POST
  server.on("/pompe", HTTP_OPTIONS, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
    server.send(204);
  });

  // Route POST /pompe : reçoit les commandes du frontend pour contrôler la pompe
  server.on("/pompe", HTTP_POST, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*"); // autorise le navigateur à lire la réponse
    if (server.hasArg("plain")) {
      String body = server.arg("plain");
      Serial.println("Commande reçue: " + body);
      // Allume ou éteint la pompe selon la commande reçue
      if (body.indexOf("\"pompe\":true") >= 0) allumerPompe();
      else eteindrePompe();
      // Active ou désactive le mode automatique
      if (body.indexOf("\"auto\":true") >= 0) modeAuto = true;
      else modeAuto = false;
    }
    server.send(200, "application/json", "{\"ok\":true}");
  });

  server.begin();
}

void loop() {
  // Écoute les requêtes HTTP entrantes du frontend - doit tourner en continu sans blocage
  server.handleClient();

  // Envoie les données toutes les 60 secondes sans bloquer le serveur
  unsigned long maintenant = millis();
  if (maintenant - dernierEnvoi >= 60000) {
    dernierEnvoi = maintenant;

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h) && !isnan(t)) {
      // Mode automatique : arrose si humidité du sol sous 30%
      if (modeAuto) {
        if (h < 30) allumerPompe();
        else eteindrePompe();
      }

      // Envoyer au serveur API
      HTTPClient http;
      http.begin(apiUrl);
      http.addHeader("Content-Type", "application/json");
      http.setTimeout(5000);

      String json = "{\"temperature\": " + String(t) + ", \"humidity\": " + String(h) + "}";
      http.POST(json);
      http.end();
    }
  }
}