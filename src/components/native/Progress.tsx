import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ProgressProps {
  value: number;
  max?: number;
  style?: ViewStyle;
  color?: string;
}

export function Progress({ value, max = 100, style, color = '#1b4a5a' }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
