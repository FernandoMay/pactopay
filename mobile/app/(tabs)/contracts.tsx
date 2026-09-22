import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { EscrowCard } from '@/components/EscrowCard';

export default function ContractsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Contratos" subtitle="Todos tus depósitos en confianza" />

      {/* Tabs */}
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>(0)</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Creando</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Firmados</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Completado</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Disputa</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search for "API"</Text>
      </View>

      <Text style={styles.emptyText}>No contracts found.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  tabs: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  tab: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: 20 },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.onPrimaryContainer },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: 24, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.lg },
  searchIcon: { fontSize: 16, marginRight: Spacing.sm },
  searchPlaceholder: { ...Typography.bodyMedium, color: Colors.outline },

  emptyText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.xxl },
});
