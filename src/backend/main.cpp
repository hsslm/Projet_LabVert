#include <WiFi.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <FS.h>
#include <SPIFFS.h>

const char* ssid = "batman";
const char* motDePasse = "selma1502";

#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const char* apiUrl = "http://172.20.10.3:3000/data";

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
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(5000);

    String json = "{\"temperature\": " + String(t) + ", \"humidity\": " + String(h) + "}";
    int httpResponseCode = http.POST(json);

    Serial.print("Réponse API: ");
    Serial.println(httpResponseCode);
    http.end();
  }

  WiFiClient client = server.available();
  if (!client) {
    yield();
    delay(5000);
    return;
  }

  Serial.println("Nouvelle requête HTTP");
  while (!client.available()) delay(1);

  String req = client.readStringUntil('\r');
  client.readStringUntil('\n');

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

  if (req.indexOf("GET /style.css") >= 0) {
    File file = SPIFFS.open("/style.css", "r");
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/css");
    client.println("Connection: close");
    client.println();
    while (file.available()) client.write(file.read());
    file.close();
    return;
  }

  if (req.indexOf("GET /script.js") >= 0) {
    File file = SPIFFS.open("/script.js", "r");
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/javascript");
    client.println("Connection: close");
    client.println();
    while (file.available()) client.write(file.read());
    file.close();
    return;
  }

  if (req.indexOf("GET /") >= 0) {
    File file = SPIFFS.open("/index.html", "r");
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    while (file.available()) client.write(file.read());
    file.close();
    return;
  }
}