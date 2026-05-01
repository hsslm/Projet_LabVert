// LabVert - Firmware ESP32
// Lit DHT11 et envoie données à l'API Node.js

#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>

// Charger la configuration depuis config.h
// IMPORTANT : Copiez config.h.example en config.h et éditez avec vos identifiants WiFi
#include "config.h"

// Utiliser les variables de config.h
const char* ssid = WIFI_SSID;
const char* motDePasse = WIFI_PASSWORD;
const char* apiUrl = API_URL;
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  Serial.println("Connexion WiFi...");
  WiFi.begin(ssid, motDePasse);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    // Envoyer au serveur API
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    String json = "{\"temperature\": " + String(t) + ", \"humidity\": " + String(h) + "}";
    http.POST(json);
    http.end();
  }

  // Attendre 60 secondes avant la prochaine mesure
  delay(60000);
}
  
