/*********
  ESP32 Backend + DHT11
*********/

#include <WiFi.h>
#include <DHT.h>
#include <FS.h>
#include <SPIFFS.h>

char* ssid ="batman";
const char* motDePasse = "selma1502";

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

WiFiServer server(80);

void setup() {
  Serial.begin(115200);
  dht.begin();

  if (!SPIFFS.begin(true)) {
    Serial.println("Erreur SPIFFS");
    return;
  }

  Serial.println("Connexion au WiFi...");
  WiFi.begin(ssid, motDePasse);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connecté !");
  Serial.print("Adresse IP: ");
  Serial.println(WiFi.localIP());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  Serial.println("Nouvelle requête HTTP");

  while (!client.available()) delay(1);

  String req = client.readStringUntil('\r');
  client.readStringUntil('\n');

  // Route JSON
  if (req.indexOf("GET /data") >= 0) {

    // valeurs brutes du DHT11
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();

    client.printf("{\"temperature\": %.1f, \"humidity\": %.1f}", t, h);
    return;
  }

  // Route HTML
  if (req.indexOf("GET /") >= 0) {
    File file = SPIFFS.open("/index.html", "r");

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();

    while (file.available()) {
      client.write(file.read());
    }
    file.close();
    return;
  }

  // Route CSS
  if (req.indexOf("GET /style.css") >= 0) {
    File file = SPIFFS.open("/style.css", "r");

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/css");
    client.println("Connection: close");
    client.println();

    while (file.available()) {
      client.write(file.read());
    }
    file.close();
    return;
  }

  // Route JS
  if (req.indexOf("GET /script.js") >= 0) {
    File file = SPIFFS.open("/script.js", "r");

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/javascript");
    client.println("Connection: close");
    client.println();

    while (file.available()) {
      client.write(file.read());
    }
    file.close();
    return;
  }
}