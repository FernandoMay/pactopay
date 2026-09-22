import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: number;
  style?: object;
}

export function Card({ children, variant = 'elevated', padding = Spacing.md, style }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

export function StatCard({ label, value, icon, trend }: {
  label: string;
  value: string;
  icon?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && <Text style={styles.statIcon}>{icon}</Text>}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {trend && (
        <Text style={[styles.trend, trend.positive ? styles.trendPositive : styles.trendNegative]}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </Text>
      )}
    </Card>
  );
}

export function Badge({ label, color = Colors.primary, textColor = Colors.onPrimary }: {
  label: string;
  color?: string;
  textColor?: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ progress, color = Colors.primary }: { progress: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
  },
  elevated: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filled: { backgroundColor: Colors.surfaceVariant },
  outlined: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.outlineVariant },

  // StatCard
  statCard: { flex: 1, minWidth: 140 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
  statIcon: { fontSize: 16, marginRight: Spacing.xs },
  statLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant },
  statValue: { ...Typography.headlineSmall, color: Colors.onSurface },
  trend: { ...Typography.labelSmall, marginTop: Spacing.xs },
  trendPositive: { color: Colors.success },
  trendNegative: { color: Colors.error },

  // Badge
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.full, alignSelf: 'flex-start' },
  badgeText: { ...Typography.labelSmall },

  // ProgressBar
  progressTrack: { height: 6, backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: BorderRadius.full },
});
