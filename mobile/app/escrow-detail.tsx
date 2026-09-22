import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Card, Badge, ProgressBar } from '@/components/Card';
import { Button } from '@/components/Button';
import { Milestone } from '@/components/Milestone';

export default function EscrowDetailScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Desarrollador Full Stack"
        subtitle="Depósito · USDC · Stellar Testnet"
        leftAction={{ icon: '←', onPress: () => {} }}
        rightAction={{ icon: '⋯', onPress: () => {} }}
      />

      {/* Status */}
      <View style={styles.statusRow}>
        <Badge label="En progreso" color={Colors.primary} />
        <Text style={styles.statusSub}>1 de 4 · 25%</Text>
      </View>
      <ProgressBar progress={25} />

      {/* Contract Info */}
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Monto total</Text>
          <Text style={styles.infoValue}>$2,500 USDC</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Financiado</Text>
          <Text style={styles.infoValue}>$2,500 USDC</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Liberado</Text>
          <Text style={styles.infoValue}>$0 USDC</Text>
        </View>
      </Card>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>Milestones</Text>
      <Milestone title="UI/UX Design" amount="$625" status="approved" dueDate="15/12/2025" />
      <Milestone title="Frontend Development" amount="$625" status="in_review" dueDate="01/03/2026" />
      <Milestone title="Backend API" amount="$625" status="pending" dueDate="15/03/2026" />
      <Milestone title="Deployment" amount="$625" status="pending" dueDate="01/04/2026" />

      {/* Deliverables */}
      <Text style={styles.sectionTitle}>Entregables</Text>
      <Card style={styles.deliverableCard}>
        <View style={styles.deliverableRow}>
          <Text style={styles.deliverableIcon}>📎</Text>
          <View style={styles.deliverableContent}>
            <Text style={styles.deliverableName}>designs_v2.fig</Text>
            <Text style={styles.deliverableMeta}>125 KB · Mar 13, 2026</Text>
          </View>
        </View>
      </Card>

      {/* Chat */}
      <Text style={styles.sectionTitle}>Chat</Text>
      <Card style={styles.chatCard}>
        <View style={styles.chatBubble}>
          <Text style={styles.chatSender}>Contratista</Text>
          <Text style={styles.chatText}>El diseño está listo para revisión.</Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Liberar pago" onPress={() => {}} fullWidth />
        <Button title="Marcar como entregado" onPress={() => {}} variant="outlined" fullWidth />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.sm },
  statusSub: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },

  infoCard: { padding: Spacing.md, marginBottom: Spacing.xl },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  infoLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  infoValue: { ...Typography.bodyMedium, color: Colors.onSurface },

  sectionTitle: { ...Typography.titleMedium, color: Colors.onSurface, marginTop: Spacing.xl, marginBottom: Spacing.md },

  deliverableCard: { padding: Spacing.md },
  deliverableRow: { flexDirection: 'row', alignItems: 'center' },
  deliverableIcon: { fontSize: 20, marginRight: Spacing.md },
  deliverableContent: { flex: 1 },
  deliverableName: { ...Typography.bodyMedium, color: Colors.onSurface },
  deliverableMeta: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  chatCard: { padding: Spacing.md },
  chatBubble: { backgroundColor: Colors.surfaceVariant, borderRadius: 16, padding: Spacing.md },
  chatSender: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, marginBottom: 4 },
  chatText: { ...Typography.bodyMedium, color: Colors.onSurface },

  actions: { marginTop: Spacing.xl, gap: Spacing.sm },
});
