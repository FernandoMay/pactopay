import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: { icon: string; onPress: () => void };
  rightAction?: { icon: string; onPress: () => void };
  showBreadline?: boolean;
}

export function Header({ title, subtitle, leftAction, rightAction, showBreadline }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction && (
          <Pressable onPress={leftAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{leftAction.icon}</Text>
          </Pressable>
        )}

        <View style={styles.titleArea}>
          {showBreadline && (
            <View style={styles.brandRow}>
              <View style={styles.breadline}>
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#006c4a' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
              </View>
              <Text style={styles.brand}>BREADLINE</Text>
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction && (
          <Pressable onPress={rightAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{rightAction.icon}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  titleArea: { flex: 1 },
  actionBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { fontSize: 20, color: Colors.onSurface },

  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  breadline: { flexDirection: 'row', gap: 3, marginRight: 6 },
  breadDot: { width: 8, height: 8, borderRadius: 4 },
  brand: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, letterSpacing: 2 },

  title: { ...Typography.headlineMedium, color: Colors.onSurface },
  subtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 2 },
});
