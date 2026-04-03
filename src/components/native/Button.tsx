import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

interface ButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
}

export function Button({
  variant = 'default',
  size = 'default',
  children,
  onPress,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.text, styles[`text_${variant}`], textStyle]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  default: {
    backgroundColor: '#1b4a5a',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: '#dc2626',
  },
  disabled: {
    opacity: 0.5,
  },
  size_default: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  size_lg: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  size_icon: {
    width: 40,
    height: 40,
    padding: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  text_default: {
    color: '#ffffff',
  },
  text_outline: {
    color: '#1b4a5a',
  },
  text_ghost: {
    color: '#1b4a5a',
  },
  text_destructive: {
    color: '#ffffff',
  },
});
