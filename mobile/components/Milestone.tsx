import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface MilestoneProps {
  title: string;
  amount: string;
  status: 'pending' | 'in_review' | 'approved' | 'disputed';
  dueDate?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const STATUS_STYLES = {
  pending: { color: Colors.outline, bg: Colors.surfaceVariant, icon: '○' },
  in_review: { color: Colors.warning, bg: Colors.warningLight, icon: '◐' },
  approved: { color: Colors.success, bg: Colors.successLight, icon: '●' },
  disputed: { color: Colors.error, bg: Colors.errorContainer, icon: '⚠' },
};

export function Milestone({ title, amount, status, dueDate, onAction, actionLabel }: MilestoneProps) {
  const config = STATUS_STYLES[status];

  return (
    <View style={styles.container}>
      <View style={[styles.statusDot, { backgroundColor: config.bg }]}>
        <Text style={{ color: config.color, fontSize: 14 }}>{config.icon}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.amount}>{amount}</Text>
        </View>
        {dueDate && <Text style={styles.dueDate}>Vence: {dueDate}</Text>}
        {onAction && (
          <Pressable onPress={onAction} style={styles.actionBtn}>
            <Text style={styles.actionText}>{actionLabel || 'Ver'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant },
  statusDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md, marginTop: 2 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.titleSmall, color: Colors.onSurface, flex: 1 },
  amount: { ...Typography.labelLarge, color: Colors.onSurfaceVariant },
  dueDate: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginTop: 2 },
  actionBtn: { marginTop: Spacing.sm, alignSelf: 'flex-start' },
  actionText: { ...Typography.labelLarge, color: Colors.primary },
});
