import axios from "axios";

// Backend receives data from ESP32 (via POST)
// Try backend first, fallback to ESP32 direct connection
const LOCAL_BACKEND_URL = "http://172.20.10.13:5000";
const ESP32_URL = "http://172.20.10.2:3000";

const axiosInstance = axios.create({
  timeout: 8000, // 8 second timeout
});

let lastSuccessfulData: any = null;

export const getWeightData = async () => {
  try {
    // Priority 1: Try backend first (ESP32 POSTs data here)
    try {
      console.log("📱 [IoT Service] Attempting backend connection to:", LOCAL_BACKEND_URL);
      const res = await axiosInstance.get(`${LOCAL_BACKEND_URL}/data`);
      if (res.data && res.data.weight !== undefined) {
        console.log("✅ [IoT Service] Connected to backend! Data:", res.data);
        lastSuccessfulData = res.data;
        return res.data;
      }
    } catch (backendError: any) {
      console.warn("⚠️ [IoT Service] Backend failed:", backendError?.message);
    }

    // Priority 2: Try ESP32 directly
    try {
      console.log("📱 [IoT Service] Attempting ESP32 connection to:", ESP32_URL);
      const res = await axiosInstance.get(`${ESP32_URL}/data`);
      if (res.data && res.data.weight !== undefined) {
        console.log("✅ [IoT Service] Connected to ESP32! Data:", res.data);
        lastSuccessfulData = res.data;
        return res.data;
      }
    } catch (esp32Error: any) {
      console.warn("⚠️ [IoT Service] ESP32 also failed:", esp32Error?.message);
    }

    // Priority 3: Return cached data
    if (lastSuccessfulData) {
      console.log("📦 [IoT Service] Using cached data:", lastSuccessfulData);
      return lastSuccessfulData;
    }

    // Priority 4: Return dummy data as fallback
    console.warn("⚠️ [IoT Service] All connections failed, returning dummy data");
    return {
      timestamp: new Date().toISOString(),
      deviceId: "ESP32-60D004E9BFB4",
      weight: 65,
      temperature: 24,
      humidity: 50,
      status: "offline",
      batteryLevel: 0,
    };
  } catch (error: any) {
    console.error("❌ [IoT Service] Unexpected error:", error?.message);
    return (
      lastSuccessfulData || {
        timestamp: new Date().toISOString(),
        deviceId: "ESP32-60D004E9BFB4",
        weight: 0,
        status: "error",
      }
    );
  }
};