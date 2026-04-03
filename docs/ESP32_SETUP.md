# ESP32 Weight Scale Setup Guide

## Hardware Setup

### Required Components:
1. **ESP32 Development Board** (e.g., ESP32-WROOM-32)
2. **HX711 Load Cell Amplifier** Module
3. **4x Load Cells** (or single load cell) - 50kg capacity recommended
4. **Micro USB Cable** (for programming)
5. **Wires** (jumper wires + 4-pin connector for load cells)

### Wiring Diagram:

```
ESP32 PIN           HX711 PIN
D0 (GPIO0)      --> SCK (Clock)
D1 (GPIO1)      --> DT (Data)
GND             --> GND
5V              --> VCC

HX711 PIN           Load Cell Connector
Red             --> (+) Excitation+
Black           --> (-) Excitation-
White           --> (+) Signal+
Green           --> (-) Signal-
```

### Load Cell Configuration:
- **Series**: Connect to same positive/negative excitation
- **Parallel**: All signal pins in parallel to HX711
- **Typical Setup**: 4x load cells in full-bridge configuration

## Software Setup

### 1. Install Arduino IDE
- Download from https://www.arduino.cc/en/software
- Install ESP32 Board Support:
  - Go to File → Preferences
  - Add to "Additional Board Manager URLs":
    ```
    https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
    ```
  - Go to Tools → Board Manager
  - Install "esp32 by Espressif Systems"

### 2. Install Required Libraries
In Arduino IDE, go to Sketch → Include Library → Manage Libraries:

1. **HX711_ADC** by Olav Kallhovd
   - Search for "HX711_ADC"
   - Install latest version

2. **WebServer** (built-in, usually)
   - For HTTP server functionality

3. **WiFi** (built-in, usually)
   - For WiFi connectivity

### 3. Upload the Firmware

1. Connect ESP32 via USB
2. Select Board: Tools → Board → ESP32 → ESP32 Dev Module
3. Select Port: Tools → Port → COM#
4. Copy the code from `ESP32_WeightScale_Firmware.ino`
5. Paste into Arduino IDE
6. **Update WiFi credentials** in the code:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
7. Click Upload (Ctrl+U)

### 4. Calibration

1. Once uploaded, open Serial Monitor (Tools → Serial Monitor, 115200 baud)
2. Wait for ESP32 to connect to WiFi
3. You'll see messages like:
   ```
   📡 Connecting to WiFi...
   ✅ WiFi Connected!
   🌐 IP address: 192.168.x.x
   ⚖️  Tare in progress...
   ⚖️  Tare complete
   ```

4. **Hardware Calibration** (first time setup):
   - Before upload, uncomment the calibration code in the sketch
   - Follow the Serial Monitor instructions
   - Note your calibration factor
   - Update `CALIBRATION_FACTOR` in the code

### 5. Testing

1. Open a browser or use curl:
   ```bash
   curl http://<ESP32_IP_ADDRESS>:3000/data
   ```

2. You should get JSON response:
   ```json
   {
     "timestamp": "2026-03-31T10:35:22Z",
     "deviceId": "ESP32-WeightScale-001",
     "weight": 65.42,
     "unit": "kg",
     "temperature": 24.5,
     "status": "connected",
     "batteryLevel": 100,
     "rawValue": 12345
   }
   ```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **ESP32 won't upload** | Check USB drivers, try different USB port, hold BOOT button while uploading |
| **WiFi won't connect** | Verify SSID/password, check ESP32 within range, restart ESP32 |
| **HX711 not reading** | Check wiring, verify load cell connections, run calibration |
| **Weight jumps around** | Tap load cells gently, ensure stable surface, reduce ADC speed if needed |
| **Can't reach http://IP:3000** | Check if ESP32 is on same network, verify firewall, restart ESP32 |

## Network Configuration

### Find ESP32 IP Address:
1. Open Serial Monitor at 115200 baud
2. Look for line: `🌐 IP address: xxx.xxx.xxx.xxx`
3. Use this IP to access the `/data` endpoint

### Set Fixed IP (Optional):
Edit the firmware to use static IP instead of DHCP:
```cpp
// IPAddress ip(172, 20, 10, 13);
// IPAddress gateway(172, 20, 10, 1);
// IPAddress subnet(255, 255, 255, 0);
// WiFi.config(ip, gateway, subnet);
```

## Performance Notes

- **Data Update Rate**: ~10 readings per second (configurable)
- **HTTP Response Time**: <100ms
- **Accuracy**: ±0.1kg (depends on load cells)
- **Power Consumption**: ~80mA in normal operation
- **WiFi Range**: Up to 100m (line of sight)

## Production Deployment

1. **Housing**: Mount ESP32 + HX711 in weatherproof enclosure
2. **Power Supply**: Use 5V USB power supply (1A minimum)
3. **Static IP**: Configure fixed IP for reliability
4. **Network**: Connect to dedicated IoT network or main WiFi
5. **Updates**: Can be done via OTA (Over-the-Air) if configured

---

**For more help**: Consult HX711 datasheets and ESP32 documentation
