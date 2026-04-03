import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

interface WebViewProps {
  uri?: string;
  html?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: any;
  showLoadingIndicator?: boolean;
}

export function WebView({
  uri,
  html,
  onLoad,
  onError,
  style,
  showLoadingIndicator = true,
}: WebViewProps) {
  const [loading, setLoading] = React.useState(true);

  const source = uri ? { uri } : html ? { html } : undefined;

  if (!source) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <RNWebView
        source={source}
        style={styles.webView}
        onLoad={() => {
          setLoading(false);
          onLoad?.();
        }}
        onError={() => {
          setLoading(false);
          onError?.();
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
      />
      {loading && showLoadingIndicator && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1b4a5a" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
