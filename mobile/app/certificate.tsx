import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Card, Badge } from '@/components/Card';
import { Button } from '@/components/Button';

export default function CertificateScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Certificado de Transacción"
        leftAction={{ icon: '←', onPress: () => {} }}
        rightAction={{ icon: '⋯', onPress: () => {} }}
      />

      {/* Certificate Card */}
      <Card style={styles.certCard}>
        {/* Notarial Header */}
        <View style={styles.notarialHeader}>
          <View style={styles.notarialRow}>
            <View style={styles.notarialLeft}>
              <View style={styles.breadline}>
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#006c4a' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
              </View>
              <Text style={styles.brandText}>BREADLINE</Text>
            </View>
            <View style={styles.notarialRight}>
              <Text style={styles.notarialLabel}>NOTARIAL CERTIFICATE</Text>
              <Text style={styles.notarialSub}>PactoPay · 2026</Text>
            </View>
          </View>
        </View>

        <Text style={styles.certType}>NOTARIAL CERTIFICATE</Text>

        {/* Blockchain Record */}
        <View style={styles.blockchainSection}>
          <Text style={styles.blockchainTitle}>BLOCKCHAIN RECORD</Text>
          <Text style={styles.blockchainHash}>Stellar Transaction ID</Text>
          <Text style={styles.hashValue}>52a704539ef...</Text>

          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>hash:</Text>
            <Text style={styles.hashFull}>d5abbc2df0d0db239b...</Text>
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>timestamp:</Text>
            <Text style={styles.hashFull}>1693393933 (2024-08-30)</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.partiesSection}>
          <Text style={styles.partiesTitle}>PARTIES</Text>
          <View style={styles.partyCard}>
            <Text style={styles.partyIcon}>👤</Text>
            <View style={styles.partyContent}>
              <Text style={styles.partyLabel}>Creación de la cuenta</Text>
              <Text style={styles.partyName}>María González</Text>
              <Text style={styles.partyHash}>STELLAR: GA5Z...FCUG</Text>
            </View>
          </View>
        </View>

        {/* Deposit Details */}
        <View style={styles.depositSection}>
          <Text style={styles.depositTitle}>DEPOSIT DETAILS</Text>
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Monto:</Text>
            <Text style={styles.depositValue}>2,500 USDC</Text>
          </View>
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Titular:</Text>
            <Text style={styles.depositValue}>Juan López</Text>
          </View>
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Destino:</Text>
            <Text style={styles.depositValue}>María González</Text>
          </View>
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Tarifa de plataforma:</Text>
            <Text style={styles.depositValue}>50 USDC (2%)</Text>
          </View>
          <View style={styles.depositRow}>
            <Text style={styles.depositLabel}>Red Stellar:</Text>
            <Text style={styles.depositValue}>0.0001</Text>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>Estado:</Text>
          <Badge label="Completado" color={Colors.success} />
        </View>

        {/* QR */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>📱 QR Code</Text>
          </View>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Descargar PDF" onPress={() => {}} variant="outlined" fullWidth icon="📥" />
        <Button title="Compartir" onPress={() => {}} variant="outlined" fullWidth icon="📤" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  certCard: { padding: Spacing.lg, marginBottom: Spacing.xl },

  notarialHeader: { marginBottom: Spacing.lg },
  notarialRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notarialLeft: { flexDirection: 'row', alignItems: 'center' },
  breadline: { flexDirection: 'row', gap: 3, marginRight: 6 },
  breadDot: { width: 6, height: 6, borderRadius: 3 },
  brandText: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  notarialRight: { alignItems: 'flex-end' },
  notarialLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, letterSpacing: 2 },
  notarialSub: { ...Typography.bodySmall, color: Colors.outline },

  certType: { ...Typography.titleMedium, color: Colors.onSurface, textAlign: 'center', letterSpacing: 4, marginBottom: Spacing.xl },

  blockchainSection: { backgroundColor: Colors.surfaceVariant, borderRadius: 12, padding: Spacing.md, marginBottom: Spacing.lg },
  blockchainTitle: { ...Typography.labelSmall, color: Colors.outline, letterSpacing: 2, marginBottom: Spacing.sm },
  blockchainHash: { ...Typography.bodySmall, color: Colors.onSurfaceVariant, marginBottom: 4 },
  hashValue: { ...Typography.titleMedium, color: Colors.onSurface, marginBottom: Spacing.sm },
  hashRow: { flexDirection: 'row', marginBottom: 4 },
  hashLabel: { ...Typography.bodySmall, color: Colors.outline, width: 80 },
  hashFull: { ...Typography.bodySmall, color: Colors.onSurface, flex: 1 },

  partiesSection: { marginBottom: Spacing.lg },
  partiesTitle: { ...Typography.labelSmall, color: Colors.outline, letterSpacing: 2, marginBottom: Spacing.sm },
  partyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceVariant, borderRadius: 12, padding: Spacing.md },
  partyIcon: { fontSize: 24, marginRight: Spacing.md },
  partyContent: { flex: 1 },
  partyLabel: { ...Typography.labelSmall, color: Colors.onSurfaceVariant },
  partyName: { ...Typography.titleMedium, color: Colors.onSurface },
  partyHash: { ...Typography.bodySmall, color: Colors.outline },

  depositSection: { marginBottom: Spacing.lg },
  depositTitle: { ...Typography.labelSmall, color: Colors.outline, letterSpacing: 2, marginBottom: Spacing.sm },
  depositRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant },
  depositLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  depositValue: { ...Typography.bodyMedium, color: Colors.onSurface },

  statusSection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  statusLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginRight: Spacing.sm },

  qrSection: { alignItems: 'center', marginBottom: Spacing.md },
  qrPlaceholder: { width: 120, height: 120, borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qrText: { ...Typography.bodySmall, color: Colors.outline },

  actions: { gap: Spacing.sm },
});
