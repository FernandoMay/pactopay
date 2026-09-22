import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface BottomNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (key: string) => void;
}

export function BottomNav({ tabs, activeTab, onTabPress }: BottomNavProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.indicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
    paddingBottom: 20,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  icon: {
    fontSize: 22,
    marginBottom: 2,
    color: Colors.outline,
  },
  iconActive: {
    color: Colors.primary,
  },
  label: {
    ...Typography.labelSmall,
    color: Colors.outline,
  },
  labelActive: {
    color: Colors.primary,
  },
  indicator: {
    width: 32,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
});
