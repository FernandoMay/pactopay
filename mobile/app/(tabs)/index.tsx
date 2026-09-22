import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Card, StatCard } from '@/components/Card';
import { EscrowCard } from '@/components/EscrowCard';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header showBreadline title="Dashboard" />

      {/* Vault Balance */}
      <Card style={styles.vault}>
        <Text style={styles.vaultLabel}>Balance in vault</Text>
        <Text style={styles.vaultAmount}>$0.00 USDC</Text>
        <Text style={styles.vaultSub}>0 contracts</Text>
      </Card>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="Activos" value="$0" icon="💰" />
        <StatCard label="Completados" value="0" icon="✅" />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Recibidos" value="$0" icon="📥" />
        <StatCard label="En disputa" value="0" icon="⚖️" />
      </View>

      {/* Active Contracts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Contratos activos</Text>
        <Text style={styles.sectionAction}>Ver todo →</Text>
      </View>

      <Text style={styles.emptyText}>No active contracts yet.</Text>
      <Text style={styles.emptyHint}>Create or accept an escrow to see it here.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  vault: { padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg, backgroundColor: Colors.primary, borderRadius: 24 },
  vaultLabel: { ...Typography.labelMedium, color: 'rgba(255,255,255,0.7)' },
  vaultAmount: { ...Typography.displaySmall, color: '#fff', marginTop: Spacing.xs },
  vaultSub: { ...Typography.bodySmall, color: 'rgba(255,255,255,0.5)', marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.titleMedium, color: Colors.onSurface },
  sectionAction: { ...Typography.labelLarge, color: Colors.primary },

  emptyText: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.md },
  emptyHint: { ...Typography.bodySmall, color: Colors.outline, textAlign: 'center', marginTop: Spacing.xs },
});
