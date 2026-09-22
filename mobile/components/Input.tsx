import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  disabled?: boolean;
  icon?: string;
  style?: object;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  disabled = false,
  icon,
  style,
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError, disabled && styles.inputDisabled]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.outline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={!disabled}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function Select({
  label,
  value,
  options,
  onValueChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        <Text style={[styles.input, !value && styles.placeholder]}>
          {value || placeholder || 'Seleccionar...'}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: { ...Typography.labelLarge, color: Colors.onSurface, marginBottom: Spacing.xs },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  inputError: { borderColor: Colors.error },
  inputDisabled: { backgroundColor: Colors.surfaceDisabled, opacity: 0.6 },
  input: { flex: 1, ...Typography.bodyLarge, color: Colors.onSurface, paddingVertical: Spacing.sm },
  placeholder: { color: Colors.outline },
  icon: { fontSize: 18, marginRight: Spacing.sm, color: Colors.onSurfaceVariant },
  chevron: { fontSize: 12, color: Colors.onSurfaceVariant, marginLeft: Spacing.sm },
  errorText: { ...Typography.bodySmall, color: Colors.error, marginTop: Spacing.xs },
});
