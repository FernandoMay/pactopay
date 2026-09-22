import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { Card } from './Card';

interface EscrowCardProps {
  title: string;
  amount: string;
  currency?: string;
  status: 'pending' | 'funded' | 'in_progress' | 'delivered' | 'disputed' | 'completed';
  counterparty?: string;
  deadline?: string;
  progress?: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: Colors.warning, bg: Colors.warningLight },
  funded: { label: 'Financiado', color: Colors.info, bg: Colors.infoLight },
  in_progress: { label: 'En progreso', color: Colors.primary, bg: Colors.primaryContainer },
  delivered: { label: 'Entregado', color: Colors.secondary, bg: Colors.secondaryContainer },
  disputed: { label: 'En disputa', color: Colors.error, bg: Colors.errorContainer },
  completed: { label: 'Completado', color: Colors.success, bg: Colors.successLight },
};

export function EscrowCard({ title, amount, currency = 'USDC', status, counterparty, deadline, progress }: EscrowCardProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={[styles.badge, { backgroundColor: config.bg }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <Text style={styles.amount}>{amount} {currency}</Text>

      {counterparty && (
        <Text style={styles.counterparty}>Para: {counterparty}</Text>
      )}

      {deadline && (
        <Text style={styles.deadline}>📅 {deadline}</Text>
      )}

      {progress !== undefined && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  title: { ...Typography.titleMedium, color: Colors.onSurface, flex: 1, marginRight: Spacing.sm },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { ...Typography.labelSmall },
  amount: { ...Typography.headlineSmall, color: Colors.onSurface, marginBottom: Spacing.xs },
  counterparty: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },
  deadline: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
  progressTrack: { height: 4, backgroundColor: Colors.surfaceVariant, borderRadius: 2, marginTop: Spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
});
