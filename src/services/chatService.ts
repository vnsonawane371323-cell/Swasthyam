import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const CHAT_PORT = 8000;
const CHAT_TIMEOUT_MS = 90000;
const isPhysicalDevice = Boolean((Constants as any).isDevice);

const getDevHostIp = (): string | null => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    NativeModules?.SourceCode?.scriptURL,
  ].filter(Boolean) as string[];

  for (const value of hostCandidates) {
    try {
      const withoutProtocol = value.includes('://') ? value.split('://')[1] : value;
      const hostPort = withoutProtocol.split('/')[0];
      const host = hostPort.split(':')[0];

      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    } catch {
      // Try next candidate
    }
  }

  return null;
};

const getCandidateUrls = (): string[] => {
  const envUrl = process.env.EXPO_PUBLIC_CHAT_API_URL?.trim();
  if (envUrl) {
    return [envUrl.replace(/\/+$/, '')];
  }

  const hostIp = getDevHostIp();
  const candidates: string[] = [];

  if (Platform.OS === 'android') {
    candidates.push(`http://10.0.2.2:${CHAT_PORT}/chat`);
  }

  if (hostIp) {
    candidates.push(`http://${hostIp}:${CHAT_PORT}/chat`);
  }

  // localhost only works on simulators/emulators running on same host machine
  if (!isPhysicalDevice) {
    candidates.push(`http://localhost:${CHAT_PORT}/chat`);
    candidates.push(`http://127.0.0.1:${CHAT_PORT}/chat`);
  }

  return [...new Set(candidates)];
};

const fetchWithTimeout = async (url: string, message: string, timeoutMs = CHAT_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

export const sendMessage = async (message: string): Promise<string> => {
  const urls = getCandidateUrls();
  let lastError: unknown = null;

  for (const url of urls) {
    try {
      console.log('[ChatAPI] Sending message to:', url);

      const response = await fetchWithTimeout(url, message);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.warn('[ChatAPI] Non-OK response:', response.status, 'from', url);
        lastError = new Error(`API Error: ${response.status}`);
        continue;
      }

      if (data?.success && data?.reply) {
        return data.reply;
      }

      return 'Server error';
    } catch (error) {
      console.warn('[ChatAPI] Failed URL:', url, error);
      lastError = error;

      if (error instanceof Error && error.name === 'AbortError') {
        return 'Server error';
      }
    }
  }

  console.error('Chat API Error:', lastError);
  return 'Server error';
};
