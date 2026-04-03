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
    delay(100);
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

    // Servir n'importe quel fichier depuis SPIFFS
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
  
