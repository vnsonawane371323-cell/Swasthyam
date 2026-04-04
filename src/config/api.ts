// API Configuration for SwasthTel App
// Automatically detects the correct IP from Expo's manifest

import { Platform } from 'react-native';
import { NativeModules } from 'react-native';
import Constants from 'expo-constants';

const normalizeApiBaseUrl = (value: string): string => {
  const trimmed = value.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const isPrivateIpv4 = (host: string): boolean => {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    return false;
  }

  const parts = host.split('.').map(Number);
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  // RFC1918 private ranges + loopback
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 127)
  );
};

const getDevHostIp = (): string | null => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    NativeModules?.SourceCode?.scriptURL,
  ].filter(Boolean) as string[];

  for (const value of hostCandidates) {
    try {
      // Handles values like "192.168.1.5:8081" or "http://192.168.1.5:8081/index.bundle..."
      const withoutProtocol = value.includes('://') ? value.split('://')[1] : value;
      const hostPort = withoutProtocol.split('/')[0];
      const host = hostPort.split(':')[0];

      // Avoid tunnel/public domains (e.g. *.expo.dev) for local backend calls.
      if (host && host !== 'localhost' && host !== '127.0.0.1' && isPrivateIpv4(host)) {
        return host;
      }
    } catch {
      // Try next candidate
    }
  }

  return null;
};

const getBaseUrl = (): string => {
  const envBase = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBase && envBase.trim()) {
    const normalized = normalizeApiBaseUrl(envBase);
    console.log('API connecting via EXPO_PUBLIC_API_BASE_URL:', normalized);
    return normalized;
  }

  if (__DEV__) {
    const ip = getDevHostIp();

    if (ip) {
      console.log('API connecting to:', `http://${ip}:5000/api`);
      return `http://${ip}:5000/api`;
    }
    
    // Fallback for different platforms
    if (Platform.OS === 'android') {
      // Android emulator uses 10.0.2.2 to access host machine
      return 'http://10.0.2.2:5000/api';
    }
    
    // iOS simulator or web
    return 'http://localhost:5000/api';
  }
  
  // Production URL - update this when you deploy
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    SOCIAL: '/auth/social',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    COMPLETE_ONBOARDING: '/auth/complete-onboarding',
    CHANGE_PASSWORD: '/auth/change-password',
    DELETE_ACCOUNT: '/auth/account',
    SEARCH_USERS: '/auth/search-users',
    FAMILY: '/auth/family',
  },
  // Oil consumption endpoints
  OIL: {
    LOG: '/oil/log',
    LOG_GROUP: '/oil/log-group',
    ANALYZE_FOOD: '/oil/analyze-food',
    ENTRIES: '/oil/entries',
    TODAY: '/oil/today',
    WEEKLY_STATS: '/oil/stats/weekly',
    USER_STATUS: '/oil/user-oil-status',
    UPDATE: '/oil',
    DELETE: '/oil',
  },
  // Group endpoints
  GROUPS: {
    BASE: '/groups',
    INVITATIONS: '/groups/invitations',
    ADMIN: '/groups/admin',
    SEARCH_USERS: '/groups/search-users',
    INVITE: (id: string) => `/groups/${id}/invite`,
    ACCEPT: (id: string) => `/groups/${id}/accept`,
    REJECT: (id: string) => `/groups/${id}/reject`,
    LEAVE: (id: string) => `/groups/${id}/leave`,
    REMOVE_MEMBER: (id: string, userId: string) => `/groups/${id}/members/${userId}`,
    PROMOTE: (id: string, userId: string) => `/groups/${id}/promote/${userId}`,
    DETAIL: (id: string) => `/groups/${id}`,
    UPDATE: (id: string) => `/groups/${id}`,
    DELETE: (id: string) => `/groups/${id}`,
  },
  // Barcode scanning endpoints
  BARCODE: {
    SCAN: '/barcode/scan',
    SCAN_BASE64: '/barcode/scan-base64',
    LOOKUP: (barcode: string) => `/barcode/lookup/${barcode}`,
    SEARCH: '/barcode/search',
  },
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
