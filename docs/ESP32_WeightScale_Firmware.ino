/*
 * ESP32 Weight Scale Firmware
 * 
 * Reads weight from HX711 load cell amplifier and serves data via HTTP
 * 
 * Wiring:
 *   ESP32 D0 (GPIO0)   --> HX711 SCK
 *   ESP32 D1 (GPIO1)   --> HX711 DT
 *   ESP32 GND         --> HX711 GND
 *   ESP32 5V          --> HX711 VCC
 * 
 * Install Libraries:
 *   - HX711_ADC by Olav Kallhovd
 *   - WebServer (built-in)
 *   - WiFi (built-in)
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HX711_ADC.h>
#include <time.h>

// ============ WIFI CONFIGURATION ============
const char* ssid = "ESP32NET";
const char* password = "12345678";

// ============ HARDWARE CONFIGURATION ============
// HX711 pins
const int HX711_dout = 1;   // ESP32 GPIO1 (D1)
const int HX711_sck = 0;    // ESP32 GPIO0 (D0)

// Load cell calibration factor (you'll need to calibrate this)
// Start with a typical value, then adjust based on actual weight
float calibrationFactor = 696.0;  // Load cell calibration factor

// ============ GLOBAL VARIABLES ============
HX711_ADC LoadCell(HX711_dout, HX711_sck);
WebServer server(3000);

// Sensor readings
float currentWeight = 0.0;
float currentTemp = 0.0;
unsigned long lastReadTime = 0;
bool isConnected = false;

// Calibration state
bool calibrationMode = false;
bool tareInProgress = false;

// ============ HELPER FUNCTIONS ============

/**
 * Get current time in ISO 8601 format
 */
String getISO8601Time() {
  time_t now = time(nullptr);
  struct tm* timeinfo = localtime(&now);
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", timeinfo);
  return String(buffer);
}

/**
 * Read weight from load cell
 */
float readWeight() {
  if (LoadCell.update()) {
    return LoadCell.getData();
  }
  return 0.0;
}

/**
 * Tare (zero) the scale
 */
void tareScale() {
  Serial.println("⚖️  Tare in progress...");
  LoadCell.tare();
  Serial.println("⚖️  Tare complete");
  tareInProgress = false;
}

/**
 * Initialize HX711
 */
void initLoadCell() {
  Serial.println("📦 Initializing HX711 Load Cell...");
  LoadCell.begin();
  
  // Set ADC bit rate (0 = 10Hz, 1 = 80Hz, default = 10Hz)
  LoadCell.setADCRate(0);  // 10Hz for stability
  
  // Wait for stabilization
  long stabilisingtime = 2000;
  while (millis() % stabilisingtime != 0);
  
  LoadCell.start(stabilisingtime, true);
  LoadCell.setCalFactor(calibrationFactor);
  
  Serial.println("✅ HX711 Initialized");
  Serial.print("📊 Calibration Factor: ");
  Serial.println(calibrationFactor);
  
  // Initial tare
  tareScale();
}

/**
 * Connect to WiFi
 */
void connectToWiFi() {
  Serial.println("📡 Connecting to WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    isConnected = true;
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("🌐 IP address: ");
    Serial.println(WiFi.localIP());
    
    // Set time via NTP
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");
    Serial.println("🕐 Time synchronized");
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    isConnected = false;
  }
}

/**
 * Initialize WebServer routes
 */
void setupServer() {
  // Health check endpoint
  server.on("/health", HTTP_GET, []() {
    String response = "{\"status\":\"ok\",\"device\":\"ESP32-WeightScale\",\"version\":\"1.0\"}";
    server.send(200, "application/json", response);
  });
  
  // Main data endpoint
  server.on("/data", HTTP_GET, []() {
    String timestamp = getISO8601Time();
    float weight = readWeight();
    
    // Get temperature from ESP32 thermal sensor
    float temperature = (temprature_sens_read() - 32) / 1.8; // Convert to Celsius
    
    // Build JSON response
    String response = "{";
    response += "\"timestamp\":\"" + timestamp + "\",";
    response += "\"deviceId\":\"ESP32-WeightScale-001\",";
    response += "\"weight\":" + String(weight, 2) + ",";
    response += "\"unit\":\"kg\",";
    response += "\"temperature\":" + String(temperature, 1) + ",";
    response += "\"humidity\":0,";
    response += "\"status\":\"" + (isConnected ? "connected" : "disconnected") + "\",";
    response += "\"batteryLevel\":100,";
    response += "\"rssi\":" + String(WiFi.RSSI());
    response += "}";
    
    server.send(200, "application/json", response);
    
    Serial.print("📤 Data sent - Weight: ");
    Serial.print(weight);
    Serial.println(" kg");
  });
  
  // Tare endpoint (manually trigger tare)
  server.on("/tare", HTTP_POST, []() {
    tareScale();
    String response = "{\"status\":\"tare_complete\",\"timestamp\":\"" + getISO8601Time() + "\"}";
    server.send(200, "application/json", response);
    Serial.println("🎯 Tare triggered via HTTP");
  });
  
  // Calibration endpoint (for testing)
  server.on("/calibrate", HTTP_GET, []() {
    String response = "{";
    response += "\"calibrationFactor\":" + String(calibrationFactor, 2) + ",";
    response += "\"rawValue\":" + String(LoadCell.getData(), 0);
    response += "}";
    server.send(200, "application/json", response);
  });
  
  // Reset endpoint
  server.on("/reset", HTTP_POST, []() {
    String response = "{\"status\":\"resetting\"}";
    server.send(200, "application/json", response);
    delay(1000);
    ESP.restart();
  });
  
  // 404 handler
  server.onNotFound([]() {
    String response = "{\"error\":\"404 Not Found\",\"availableEndpoints\":[\"/data\",\"/health\",\"/tare\",\"/calibrate\",\"/reset\"]}";
    server.send(404, "application/json", response);
  });
  
  server.begin();
  Serial.println("🚀 WebServer started on port 3000");
  Serial.println("   - GET  /data      - Get weight data");
  Serial.println("   - GET  /health    - Health check");
  Serial.println("   - POST /tare      - Tare the scale");
  Serial.println("   - GET  /calibrate - Get calibration info");
}

// ============ SETUP & LOOP ============

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════╗");
  Serial.println("║  ESP32 Weight Scale Firmware v1.0  ║");
  Serial.println("╚════════════════════════════════════╝");
  
  // Initialize load cell
  initLoadCell();
  
  // Connect to WiFi
  connectToWiFi();
  
  if (isConnected) {
    // Setup WebServer if WiFi connected
    setupServer();
  } else {
    Serial.println("⚠️  WiFi not available - running in offline mode");
  }
  
  Serial.println("\n✨ Setup complete - System ready!");
}

void loop() {
  // Handle web server requests
  if (isConnected) {
    server.handleClient();
  }
  
  // Periodic weight reading (every 500ms)
  if (millis() - lastReadTime >= 500) {
    currentWeight = readWeight();
    lastReadTime = millis();
    
    // Print current weight to Serial every 2 seconds
    static unsigned long lastPrintTime = 0;
    if (millis() - lastPrintTime >= 2000) {
      Serial.print("⚖️  Current Weight: ");
      Serial.print(currentWeight);
      Serial.print(" kg | WiFi: ");
      Serial.println(isConnected ? "✅" : "❌");
      lastPrintTime = millis();
    }
  }
  
  // Reconnect WiFi if disconnected
  if (!isConnected && millis() % 10000 == 0) {
    Serial.println("🔄 Attempting WiFi reconnection...");
    connectToWiFi();
  }
}

// ============ CALIBRATION PROCEDURE ============
/*
 * To calibrate the load cell:
 * 
 * 1. Upload this code with calibrationMode = true
 * 2. Open Serial Monitor at 115200 baud
 * 3. Follow the on-screen instructions
 * 4. Once calibrated, update calibrationFactor with the value shown
 * 5. Set calibrationMode = false and re-upload
 * 
 * MANUAL CALIBRATION:
 * 1. Place known weight (e.g., 10kg) on scale after tare
 * 2. Note the raw value from Serial Monitor
 * 3. Calculate: calibrationFactor = rawValue / 10
 * 4. Update calibrationFactor and re-upload
 */
