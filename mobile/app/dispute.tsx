import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Card, Badge } from '@/components/Card';
import { Button } from '@/components/Button';

export default function DisputeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Disputa · Diseño Web"
        leftAction={{ icon: '←', onPress: () => {} }}
        rightAction={{ icon: '⋯', onPress: () => {} }}
      />

      {/* Status */}
      <View style={styles.statusRow}>
        <Badge label="En disputa" color={Colors.error} />
        <Text style={styles.statusSub}>Milestone 2/4</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabs}>
        <View style={[styles.tab, styles.tabActive]}>
          <Text style={[styles.tabText, styles.tabTextActive]}>Evidencia del freelancer</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Evidencia del contratante</Text>
        </View>
        <View style={styles.tab}>
          <Text style={styles.tabText}>Resumen del árbitro</Text>
        </View>
      </View>

      {/* Dispute Details */}
      <Card style={styles.detailCard}>
        <Text style={styles.detailTitle}>Descripción de la disputa</Text>
        <Text style={styles.detailText}>El cliente solicita reembolso alegando que el diseño no cumple con los requisitos iniciales. El freelancer present evidencia de las iteraciones aprobadas.</Text>
      </Card>

      {/* Timeline */}
      <Text style={styles.sectionTitle}>Línea de tiempo</Text>
      <View style={styles.timeline}>
        {[
          { date: '15 Dic 2025', event: 'Disputa iniciada', color: Colors.error },
          { date: '16 Dic 2025', event: 'Evidencia presentada por freelancer', color: Colors.info },
          { date: '17 Dic 2025', event: 'Respuesta del contratante', color: Colors.warning },
          { date: '18 Dic 2025', event: 'En revisión del árbitro', color: Colors.primary },
        ].map((item, i) => (
          <View key={i} style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
            {i < 3 && <View style={styles.timelineLine} />}
            <View style={styles.timelineContent}>
              <Text style={styles.timelineDate}>{item.date}</Text>
              <Text style={styles.timelineEvent}>{item.event}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Documents */}
      <Text style={styles.sectionTitle}>Documentos adjuntos</Text>
      <Card style={styles.docCard}>
        <View style={styles.docRow}>
          <Text style={styles.docIcon}>📄</Text>
          <View style={styles.docContent}>
            <Text style={styles.docName}>contract_v1.pdf</Text>
            <Text style={styles.docMeta}>Contrato original con especificaciones</Text>
          </View>
        </View>
      </Card>

      <Button title="Enviar a arbitraje" onPress={() => {}} fullWidth style={styles.arbitBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.md },
  statusSub: { ...Typography.labelMedium, color: Colors.onSurfaceVariant },

  tabs: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.xl },
  tab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { ...Typography.labelSmall, color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.onPrimaryContainer },

  detailCard: { padding: Spacing.lg, marginBottom: Spacing.xl },
  detailTitle: { ...Typography.titleMedium, color: Colors.onSurface, marginBottom: Spacing.sm },
  detailText: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },

  sectionTitle: { ...Typography.titleMedium, color: Colors.onSurface, marginBottom: Spacing.md },

  timeline: { paddingLeft: Spacing.md, marginBottom: Spacing.xl },
  timelineItem: { flexDirection: 'row', marginBottom: Spacing.md },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4, marginRight: Spacing.md },
  timelineLine: { position: 'absolute', left: 5, top: 16, width: 2, height: 40, backgroundColor: Colors.outlineVariant },
  timelineContent: { flex: 1 },
  timelineDate: { ...Typography.labelSmall, color: Colors.outline },
  timelineEvent: { ...Typography.bodyMedium, color: Colors.onSurface },

  docCard: { padding: Spacing.md, marginBottom: Spacing.lg },
  docRow: { flexDirection: 'row', alignItems: 'center' },
  docIcon: { fontSize: 20, marginRight: Spacing.md },
  docContent: { flex: 1 },
  docName: { ...Typography.bodyMedium, color: Colors.onSurface },
  docMeta: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  arbitBtn: { marginTop: Spacing.md },
});
