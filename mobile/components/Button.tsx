import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

type ButtonVariant = 'filled' | 'outlined' | 'text' | 'tonal';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: object;
}

export function Button({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const getContainerStyle = () => {
    switch (variant) {
      case 'filled':
        return disabled ? styles.filledDisabled : styles.filled;
      case 'outlined':
        return disabled ? styles.outlinedDisabled : styles.outlined;
      case 'tonal':
        return disabled ? styles.tonalDisabled : styles.tonal;
      case 'text':
        return styles.text;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'filled':
        return disabled ? styles.textFilledDisabled : styles.textFilled;
      case 'outlined':
        return disabled ? styles.textOutlinedDisabled : styles.textOutlined;
      case 'tonal':
        return disabled ? styles.textTonalDisabled : styles.textTonal;
      case 'text':
        return disabled ? styles.textDisabled : styles.textLabel;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return styles.sizeSm;
      case 'md': return styles.sizeMd;
      case 'lg': return styles.sizeLg;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, getTextStyle()]}>
        {loading ? 'Cargando...' : title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.xl,
  },
  fullWidth: { width: '100%' },
  pressed: { opacity: 0.8 },
  icon: { marginRight: Spacing.sm },
  label: { ...Typography.labelLarge },

  // Variants
  filled: { backgroundColor: Colors.primary },
  filledDisabled: { backgroundColor: Colors.surfaceDisabled },
  outlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.outline },
  outlinedDisabled: { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.surfaceDisabled },
  tonal: { backgroundColor: Colors.primaryContainer },
  tonalDisabled: { backgroundColor: Colors.surfaceDisabled },
  text: { backgroundColor: 'transparent' },

  // Text colors
  textFilled: { color: Colors.onPrimary },
  textFilledDisabled: { color: Colors.onSurfaceDisabled },
  textOutlined: { color: Colors.primary },
  textOutlinedDisabled: { color: Colors.onSurfaceDisabled },
  textTonal: { color: Colors.onPrimaryContainer },
  textTonalDisabled: { color: Colors.onSurfaceDisabled },
  textLabel: { color: Colors.primary },
  textDisabled: { color: Colors.onSurfaceDisabled },

  // Sizes
  sizeSm: { paddingVertical: 8, paddingHorizontal: 16, minHeight: 36 },
  sizeMd: { paddingVertical: 12, paddingHorizontal: 24, minHeight: 48 },
  sizeLg: { paddingVertical: 16, paddingHorizontal: 32, minHeight: 56 },
});
