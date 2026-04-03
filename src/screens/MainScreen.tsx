import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import WeightCard from '../components/WeightCard';
import { getWeightData } from '../services/iotService';

interface IoTData {
  deviceId?: string;
  weight?: number;
}

export default function MainScreen() {
  const [data, setData] = useState<IoTData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data immediately on mount
    const fetchData = async () => {
      try {
        const response = await getWeightData();
        if (response) {
          setData(response);
          setError(null);
        } else {
          setError('Failed to fetch weight data');
        }
      } catch (err) {
        setError('Error connecting to IoT device');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up interval to fetch data every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await getWeightData();
        if (response) {
          setData(response);
          setError(null);
        } else {
          setError('Failed to fetch weight data');
        }
      } catch (err) {
        setError('Error connecting to IoT device');
        console.error('Fetch error:', err);
      }
    }, 2000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF9500" />
        <Text style={styles.loadingText}>Connecting to IoT device...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>⚠️ Connection Error</Text>
        <Text style={styles.errorDetailText}>{error}</Text>
        <Text style={styles.debugText}>Make sure:</Text>
        <Text style={styles.debugText}>• Backend is running on port 5000</Text>
        <Text style={styles.debugText}>• You're on the same WiFi network</Text>
        <Text style={styles.debugText}>• Device IP: 172.20.10.13</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WeightCard data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1820',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorDetailText: {
    color: '#ff8888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  debugText: {
    color: '#aaaaaa',
    fontSize: 12,
    textAlign: 'left',
    marginVertical: 2,
    fontFamily: 'monospace',
  },
});
