// LabVert - Firmware ESP32
// Lit DHT11 et envoie données à l'API Node.js

#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <FS.h>
#include <SPIFFS.h>

// Configuration - À adapter selon votre réseau
const char* ssid = "batman";
const char* motDePasse = "selma1502";
const char* apiUrl = "http://172.20.10.3:3000/data";

// Capteur DHT11 sur GPIO 4
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Fichiers statiques (HTML/CSS/JS)
  if (!SPIFFS.begin(true)) {
    Serial.println("Erreur SPIFFS");
    return;
  }

  Serial.println("Connexion WiFi...");
  WiFi.begin(ssid, motDePasse);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  server.begin();
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

  // Serveur web pour les requêtes locales (HTML/CSS/JS)
  WiFiClient client = server.available();
  if (!client) {
    yield();
    delay(100);
    return;
  }

  while (!client.available()) delay(1);
  String req = client.readStringUntil('\r');
  client.readStringUntil('\n');

  // Endpoint pour accéder directement aux données du capteur
  if (req.indexOf("GET /data") >= 0) {
    float h2 = dht.readHumidity();
    float t2 = dht.readTemperature();
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();
    client.printf("{\"temperature\": %.1f, \"humidity\": %.1f}", t2, h2);
    return;
  }

  // Servir les fichiers statiques
  String path = req.substring(4);
  int spacePos = path.indexOf(' ');
  if (spacePos > 0) path = path.substring(0, spacePos);

  if (path == "/" || path == "") path = "/acceuil.html";

  String contentType = "text/plain";
  if (path.endsWith(".html")) contentType = "text/html";
  else if (path.endsWith(".css")) contentType = "text/css";
  else if (path.endsWith(".js")) contentType = "application/javascript";
  else if (path.endsWith(".jpg")) contentType = "image/jpeg";
  else if (path.endsWith(".png")) contentType = "image/png";

  if (SPIFFS.exists(path)) {
    File file = SPIFFS.open(path, "r");
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: " + contentType);
    client.println("Connection: close");
    client.println();
    uint8_t buf[512];
    size_t len;
while ((len = file.read(buf, sizeof(buf))) > 0) {
    client.write(buf, len);
}

    file.close();
  } else {
    client.println("HTTP/1.1 404 Not Found");
    client.println("Connection: close");
    client.println();
    client.println("404 Not Found");
  }
}
  
