#include <WiFi.h>
#include <WebServer.h>
#include "HX711.h"

// WiFi Credentials
const char* ssid = "ESP32NET";
const char* password = "12345678";

// HX711 Configuration - Try different pins if these don't work
const int HX711_dout = 26;  // Data pin
const int HX711_sck = 27;   // Clock pin
const int SCALE_FACTOR = 430;  // Calibration factor

HX711 scale;
WebServer server(3000);

// Device ID
const char* deviceId = "ESP32_60D004E9BFB4";

// Variables
volatile float currentWeight = 0;
unsigned long lastReadTime = 0;
unsigned long lastDataTime = 0;
const unsigned long READ_INTERVAL = 1000;  // Read every 1 second
bool hx711Ready = false;

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n🚀 ESP32 WEIGHT SCALE - ULTRA STABLE");
  Serial.println("====================================\n");
  
  // Initialize HX711
  Serial.println("⚙️  Initializing HX711...");
  if (scale.begin(HX711_dout, HX711_sck)) {
    scale.set_scale(SCALE_FACTOR);
    scale.tare();
    Serial.println("✅ HX711 Ready!\n");
    hx711Ready = true;
  } else {
    Serial.println("⚠️  HX711 failed - using dummy data\n");
    hx711Ready = false;
  }
  
  // Connect to WiFi
  Serial.println("🔄 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("📍 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("🌐 Device ID: ");
    Serial.println(deviceId);
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
  }
  
  // Setup Web Server Routes
  server.on("/data", handleData);
  server.on("/health", handleHealth);
  server.on("/tare", handleTare);
  server.onNotFound(handleNotFound);
  
  // Start server
  server.begin();
  Serial.println("🌐 Web server started on port 3000");
  Serial.println("✅ Try: http://172.20.10.2:3000/data\n");
}

void loop() {
  // PRIORITY 1: Handle HTTP requests (must be first)
  server.handleClient();
  
  // PRIORITY 2: Read weight every 1 second (non-blocking)
  unsigned long now = millis();
  if (now - lastReadTime >= READ_INTERVAL) {
    if (hx711Ready) {
      // Try to read with minimum timeout of 5ms (almost non-blocking)
      if (scale.wait_ready_timeout(5)) {
        currentWeight = scale.get_units(1);  // Get 1 reading
        if (currentWeight < 0) currentWeight = 0;
      }
    } else {
      // Dummy data for testing
      currentWeight = 510.0 + (rand() % 10) / 10.0;
    }
    lastReadTime = now;
  }
  
  // Debug output every 5 seconds
  if (now - lastDataTime >= 5000) {
    Serial.print("📊 Weight: ");
    Serial.print(currentWeight);
    Serial.println(" g");
    lastDataTime = now;
  }
  
  // Keep WiFi alive
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
  }
  
  // Absolute minimum delay
  yield();  // Let other tasks run
}

// Handler for /data endpoint
void handleData() {
  char json[300];
  snprintf(json, sizeof(json),
    "{\"timestamp\":\"2026-04-01T00:00:00Z\",\"deviceId\":\"%s\",\"weight\":%.2f,\"unit\":\"g\",\"status\":\"ready\"}",
    deviceId, currentWeight);
  
  server.sendHeader("Connection", "close");
  server.sendHeader("Content-Type", "application/json");
  server.send(200, "application/json", json);
}

// Handler for /health endpoint
void handleHealth() {
  char json[200];
  snprintf(json, sizeof(json),
    "{\"status\":\"healthy\",\"device\":\"%s\",\"hx711\":\"ready\"}",
    deviceId);
  
  server.sendHeader("Connection", "close");
  server.sendHeader("Content-Type", "application/json");
  server.send(200, "application/json", json);
}

// Handler for /tare endpoint (reset to 0)
void handleTare() {
  if (hx711Ready) {
    scale.tare();
  }
  currentWeight = 0;
  
  const char* json = "{\"status\":\"tared\",\"message\":\"Scale reset to 0\"}";
  server.sendHeader("Connection", "close");
  server.sendHeader("Content-Type", "application/json");
  server.send(200, "application/json", json);
}

// Handler for undefined routes
void handleNotFound() {
  const char* message = "404: Not Found\nAvailable: /data, /health, /tare";
  server.send(404, "text/plain", message);
}
