# ESP32 Weight Scale - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Get Hardware
```
🛒 Shopping List:
- ESP32 Dev Board ($5-10)
- HX711 Load Cell Module ($5)
- 4x 50kg Load Cells ($20-40)
- Micro USB Cable (you probably have one)
- Jumper Wires
```

### Step 2: Install Arduino IDE
- Download: https://www.arduino.cc/en/software
- Add ESP32 board support (see ESP32_SETUP.md)

### Step 3: Install Libraries
Search and install in Arduino IDE:
- `HX711_ADC` by Olav Kallhovd

### Step 4: Update Firmware
1. Open `docs/ESP32_WeightScale_Firmware.ino` in Arduino IDE
2. Update WiFi credentials:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
3. Connect ESP32 via USB
4. Press Upload ⬆️

### Step 5: Check Serial Monitor
- Open: Tools → Serial Monitor
- Baud Rate: 115200
- You should see:
   ```
   ✅ WiFi Connected!
   🌐 IP address: 192.168.x.x
   ⚖️  Tare complete
   ✨ Setup complete - System ready!
   ```

### Step 6: Update Your App
Update [`src/services/iotService.ts`](src/services/iotService.ts):
```typescript
const ESP32_URL = "http://192.168.x.x:3000"; // Use IP from Serial Monitor
```

### Step 7: Test
Open browser:
```
http://192.168.x.x:3000/data
```

You should see:
```json
{
  "timestamp": "2026-03-31T10:35:22Z",
  "deviceId": "ESP32-WeightScale-001",
  "weight": 0.00,
  "status": "connected"
}
```

---

## 🔧 Common Issues

| Problem | Solution |
|---------|----------|
| **Can't upload to ESP32** | 1. Check USB drivers<br>2. Try different USB port<br>3. Hold BOOT button while uploading |
| **WiFi won't connect** | 1. Verify SSID/password<br>2. Check WiFi is 2.4GHz (ESP32 doesn't support 5GHz)<br>3. Restart ESP32 (unplug USB) |
| **Weight reading is 0** | 1. Ensure load cells are properly wired<br>2. Run calibration procedure<br>3. Make sure nothing is on the scale |
| **Can't reach `/data` endpoint** | 1. Verify ESP32 is on same network<br>2. Check firewall (port 3000)<br>3. Ping IP address: `ping 192.168.x.x` |

---

## 📊 Calibration (First Time Only)

### Quick Calibration:
1. ESP32 with firmware uploaded
2. Open Serial Monitor (115200 baud)
3. It will automatically tare when starting
4. Place known weight (e.g., 10kg) on scale
5. Note the raw value from Serial Monitor
6. Calculate: `calibrationFactor = rawValue / 10 kg`
7. Update in firmware and re-upload

### Example:
```
Serial shows: "📊 Raw Value: 6960"
Weight used: 10kg
Calculation: 6960 / 10 = 696

Update firmware:
float calibrationFactor = 696.0;
```

---

## 🌐 API Endpoints

### Get Weight Data
```bash
GET http://ESP32_IP:3000/data
```
Response:
```json
{
  "timestamp": "2026-03-31T10:35:22Z",
  "deviceId": "ESP32-WeightScale-001",
  "weight": 65.42,
  "unit": "kg",
  "temperature": 24.5,
  "status": "connected",
  "batteryLevel": 100,
  "rssi": -45
}
```

### Health Check
```bash
GET http://ESP32_IP:3000/health
```

### Tare (Zero) Scale
```bash
POST http://ESP32_IP:3000/tare
```

### Get Calibration Info
```bash
GET http://ESP32_IP:3000/calibrate
```

---

## 📍 Finding ESP32 IP Address

### Method 1: Serial Monitor (Easiest)
1. Open Serial Monitor at 115200 baud
2. Look for: `🌐 IP address: xxx.xxx.xxx.xxx`

### Method 2: Router Admin Panel
1. Log into your WiFi router (usually 192.168.1.1)
2. Look for connected devices
3. Find ESP32 in the list

### Method 3: Network Scan
Using PowerShell:
```powershell
arp -a  # Windows
```

---

## 🔌 Wiring Diagram

```
ESP32 BOARD                    HX711 MODULE
┌─────────────────┐            ┌──────────────┐
│                 │            │              │
│    GPIO0 (D0) ──┼────────────┼─ SCK         │
│    GPIO1 (D1) ──┼────────────┼─ DT          │
│    GND ─────────┼────────────┼─ GND         │
│    5V ──────────┼────────────┼─ VCC         │
│                 │            │              │
└─────────────────┘            └──────────────┘
                                       │
                              ┌────────┴────────┐
                              │  LOAD CELL      │
                              │  (4x in bridge) │
                              └─────────────────┘
```

---

## 📱 Integration into Your App

Your app is configured to use:
```
ESP32 (Primary):     http://172.20.10.13:3000/data
Backend (Fallback):  http://172.20.10.13:5000/data
```

The app will automatically:
1. Try ESP32 first
2. Fall back to backend if ESP32 unreachable
3. Update every 2 seconds
4. Show loading state while connecting
5. Display live weight data

---

## ✅ Success Checklist

- [ ] ESP32 set up with firmware
- [ ] WiFi connected (check Serial Monitor)
- [ ] IP address noted
- [ ] Load cells wired correctly
- [ ] Calibration factor updated
- [ ] Weight scale responds to requests
- [ ] App updated with correct ESP32 IP
- [ ] App displays live weight data
- [ ] Weight updates every 2 seconds

---

## 🎯 Next Steps

1. **Mount & Secure**: Place ESP32 + HX711 in stable location with load cells underneath
2. **Test Accuracy**: Verify weight readings match known weights
3. **WiFi Stability**: Monitor connection strength (check `rssi` value)
4. **Production**: Consider static IP assignment and redundant power supply
5. **Logging**: Add data storage to track weight history

---

## 📞 Support

If you get stuck:
1. Check Serial Monitor output (115200 baud)
2. Review ESP32_SETUP.md for detailed instructions
3. Verify IP address accessibility: `ping IP_ADDRESS`
4. Test endpoint directly in browser or curl

Good luck! 🚀
