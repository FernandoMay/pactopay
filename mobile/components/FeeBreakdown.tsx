import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from './Card';

interface FeeBreakdownProps {
  subtotal: string;
  platformFee: string;
  networkFee: string;
  total: string;
  currency?: string;
}

export function FeeBreakdown({ subtotal, platformFee, networkFee, total, currency = 'USDC' }: FeeBreakdownProps) {
  return (
    <Card variant="outlined" style={styles.card}>
      <Text style={styles.title}>Desglose de tarifas</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{subtotal} {currency}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Tarifa plataforma (2%)</Text>
        <Text style={styles.value}>{platformFee} {currency}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Red Stellar</Text>
        <Text style={styles.value}>{networkFee} {currency}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total} {currency}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: Spacing.md },
  title: { ...Typography.titleSmall, color: Colors.onSurface, marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  label: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  value: { ...Typography.bodyMedium, color: Colors.onSurface },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: Spacing.sm },
  totalLabel: { ...Typography.titleSmall, color: Colors.onSurface },
  totalValue: { ...Typography.titleSmall, color: Colors.primary },
});
