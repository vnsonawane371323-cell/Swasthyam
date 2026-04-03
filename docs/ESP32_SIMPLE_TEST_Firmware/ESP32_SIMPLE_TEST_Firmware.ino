#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "HX711.h"
#include "time.h"

// ---------------- WIFI ----------------
// ✅ Use mobile hotspot "Ankit"

const char* ssid     = "ESP32NET";
const char* password = "12345678";

// ---------------- SERVER ---------------- 
// IMPORTANT:
// 1) Connect your LAPTOP to the same hotspot "Ankit"
// 2) Run `ipconfig` (Windows) or `ifconfig` (Linux/Mac)
// 3) Take the laptop's IPv4 address on that Wi-Fi interface, e.g. 192.168.43.123
// 4) Put it below instead of 192.168.xx.xx

const char* serverUrl = "http://172.20.10.13:3000/data";
// ---------------- HX711 ----------------
#define DT 21
#define SCK 22
HX711 scale;

// ✅ Calibration factor
float calibration_factor = -264;

// ---------------- Moving average ----------------
const int samples = 10;
float values[samples];
int index1 = 0;
float total = 0;

// ---------------- Stability ----------------
float lastWeight = 0;
float lastSentWeight = 0;
int stableCount = 0;
bool stableSent = false;

// ---------------- NTP ----------------
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 19800; // IST +5:30
const int daylightOffset_sec = 0;
bool timeSynced = false;

// ---------------- Device ID ----------------
String deviceId;  // will be filled from chip ID

// ------ Forward declaration ------
void sendToServer(float w);
void connectWiFi();

void setup() {
  Serial.begin(115200);

  // -------- ESP32 UNIQUE ID --------
  uint64_t chipid = ESP.getEfuseMac();
  char chipIdStr[20];
  sprintf(chipIdStr, "%04X%08X",
          (uint16_t)(chipid >> 32),
          (uint32_t)chipid);
  deviceId = "ESP32_" + String(chipIdStr);

  Serial.print("Device ID: ");
  Serial.println(deviceId);

  // -------- HX711 setup --------
  scale.begin(DT, SCK);
  scale.set_scale(calibration_factor);
  scale.tare();

  for (int i = 0; i < samples; i++) values[i] = 0;

  // -------- WiFi --------
  connectWiFi();

  // -------- Time with timeout --------
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for time sync...");
  time_t nowSecs = 0;
  unsigned long start = millis();

  // wait max ~15 seconds for NTP
  while ((nowSecs < 1000000000) && (millis() - start < 15000)) {
    delay(500);
    Serial.print(".");
    nowSecs = time(nullptr);
  }

  if (nowSecs < 1000000000) {
    Serial.println("\n⚠️ Time sync FAILED (continuing anyway)");
    timeSynced = false;
  } else {
    Serial.println("\n✅ Time synced");
    timeSynced = true;
  }

  Serial.println("\n🔧 Ready! Place object to measure...");
}

void loop() {
  // simple auto-reconnect if WiFi drops
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost, reconnecting...");
    connectWiFi();
  }

  float reading = scale.get_units(5);
  if (reading < 0) reading = 0;

  // Moving average
  total -= values[index1];
  values[index1] = reading;
  total += values[index1];
  index1 = (index1 + 1) % samples;

  float weight = total / samples;

  // Stability check
  if (abs(weight - lastWeight) < 1.0) {
    stableCount++;
  } else {
    stableCount = 0;
    stableSent = false;
  }
  lastWeight = weight;

  // If stable long enough and changed significantly, send once
  if (stableCount > 8 && !stableSent && abs(weight - lastSentWeight) > 2.0) {
    lastSentWeight = weight;
    stableSent = true;

    // Display
    Serial.println("\n📊 STABLE WEIGHT DETECTED");
    Serial.print("Device: ");
    Serial.println(deviceId);
    Serial.print("Weight: ");
    Serial.print(weight, 2);
    Serial.println(" g");

    // Send to server
    sendToServer(weight);
  }

  delay(300);
}

// -------- WiFi connect helper --------
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 40) { // ~20 seconds
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi connection failed (will keep running and retry in loop)");
  }
}

// ---------------- Send to Server ----------------
void sendToServer(float w) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected, skipping upload");
    return;
  }

  // Create JSON payload
  DynamicJsonDocument doc(256);
  doc["deviceId"] = deviceId;
  doc["weight"] = w;

  String json;
  serializeJson(doc, json);

  Serial.println("\n📤 Sending to server...");
  Serial.println("URL: " + String(serverUrl));
  Serial.println("Payload: " + json);

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000); // 5 second timeout

  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.printf("✅ POST Response Code: %d\n", httpCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.printf("❌ POST Failed, Error: %s\n", 
                  http.errorToString(httpCode).c_str());
  }
  
  http.end();
  Serial.println("---");
}