// Social Authentication Service for SwasthTel App
// Handles Google, Facebook, and Apple authentication

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import { API_BASE_URL } from '../config/api';

// Complete web browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// ============================================
// CONFIGURATION - Replace with your actual credentials
// ============================================

// Google OAuth Configuration
// Get these from: https://console.cloud.google.com/apis/credentials
const GOOGLE_CONFIG = {
  expoClientId: 'YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

// Facebook App Configuration
// Get these from: https://developers.facebook.com/apps
const FACEBOOK_CONFIG = {
  clientId: 'YOUR_FACEBOOK_APP_ID',
};

// ============================================
// Types
// ============================================

export interface SocialAuthResult {
  success: boolean;
  provider: 'google' | 'facebook' | 'apple';
  token?: string;
  user?: SocialUser;
  error?: string;
}

export interface SocialUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: string;
}

// ============================================
// Google Authentication
// ============================================

export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({
    scheme: 'com.swasthtel.app',
    path: 'auth/google',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    scopes: ['profile', 'email'],
    redirectUri,
  });

  const signInWithGoogle = async (): Promise<SocialAuthResult> => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.accessToken) {
          // Fetch user info from Google
          const userInfoResponse = await fetch(
            'https://www.googleapis.com/userinfo/v2/me',
            {
              headers: { Authorization: `Bearer ${authentication.accessToken}` },
            }
          );
          
          const userInfo = await userInfoResponse.json();
          
          // Send to backend for JWT token
          const backendResponse = await fetch(`${API_BASE_URL}/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'google',
              accessToken: authentication.accessToken,
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
              },
            }),
          });
          
          const data = await backendResponse.json();
          
          if (data.success) {
            return {
              success: true,
              provider: 'google',
              token: data.token,
              user: data.user,
            };
          }
          
          return {
            success: false,
            provider: 'google',
            error: data.message || 'Backend authentication failed',
          };
        }
      }
      
      return {
        success: false,
        provider: 'google',
        error: result.type === 'cancel' ? 'Sign in cancelled' : 'Sign in failed',
      };
    } catch (error) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        provider: 'google',
        error: error instanceof Error ? error.message : 'Google sign in failed',
      };
    }
  };

  return {
    request,
    response,
    signInWithGoogle,
    isReady: !!request,
  };
}

// ============================================
// Facebook Authentication
// ============================================

export function useFacebookAuth() {
  const redirectUri = makeRedirectUri({
    scheme: 'com.swasthtel.app',
    path: 'auth/facebook',
  });

  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_CONFIG.clientId,
    scopes: ['public_profile', 'email'],
    redirectUri,
  });

  const signInWithFacebook = async (): Promise<SocialAuthResult> => {
    try {
      const result = await promptAsync();
      
      if (result.type === 'success') {
        const { authentication } = result;
        
        if (authentication?.accessToken) {
          // Fetch user info from Facebook
          const userInfoResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${authentication.accessToken}`
          );
          
          const userInfo = await userInfoResponse.json();
          
          // Send to backend for JWT token
          const backendResponse = await fetch(`${API_BASE_URL}/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: 'facebook',
              accessToken: authentication.accessToken,
              user: {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture?.data?.url,
              },
            }),
          });
          
          const data = await backendResponse.json();
          
          if (data.success) {
            return {
              success: true,
              provider: 'facebook',
              token: data.token,
              user: data.user,
            };
          }
          
          return {
            success: false,
            provider: 'facebook',
            error: data.message || 'Backend authentication failed',
          };
        }
      }
      
      return {
        success: false,
        provider: 'facebook',
        error: result.type === 'cancel' ? 'Sign in cancelled' : 'Sign in failed',
      };
    } catch (error) {
      console.error('Facebook sign in error:', error);
      return {
        success: false,
        provider: 'facebook',
        error: error instanceof Error ? error.message : 'Facebook sign in failed',
      };
    }
  };

  return {
    request,
    response,
    signInWithFacebook,
    isReady: !!request,
  };
}

// ============================================
// Apple Authentication (iOS only)
// ============================================

export async function signInWithApple(): Promise<SocialAuthResult> {
  try {
    // Check if Apple Authentication is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    
    if (!isAvailable) {
      return {
        success: false,
        provider: 'apple',
        error: 'Apple Sign In is not available on this device',
      };
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Send to backend for JWT token
    const backendResponse = await fetch(`${API_BASE_URL}/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'apple',
        identityToken: credential.identityToken,
        user: {
          id: credential.user,
          email: credential.email,
          name: credential.fullName
            ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
            : undefined,
        },
      }),
    });

    const data = await backendResponse.json();

    if (data.success) {
      return {
        success: true,
        provider: 'apple',
        token: data.token,
        user: data.user,
      };
    }

    return {
      success: false,
      provider: 'apple',
      error: data.message || 'Backend authentication failed',
    };
  } catch (error: any) {
    if (error.code === 'ERR_CANCELED') {
      return {
        success: false,
        provider: 'apple',
        error: 'Sign in cancelled',
      };
    }
    
    console.error('Apple sign in error:', error);
    return {
      success: false,
      provider: 'apple',
      error: error instanceof Error ? error.message : 'Apple sign in failed',
    };
  }
}

// ============================================
// Check if Apple Sign In is available
// ============================================

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}
