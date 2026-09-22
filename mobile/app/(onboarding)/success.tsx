import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function SuccessScreen() {
  return (
    <View style={styles.container}>
      {/* Celebration */}
      <View style={styles.celebration}>
        <Text style={styles.celebrationEmoji}>🎉</Text>
        <Text style={styles.title}>Your account is ready</Text>
        <Text style={styles.subtitle}>¡Listo para recibir y enviar depósitos en confianza!</Text>
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.profileName}>María González</Text>
        <Text style={styles.profileEmail}>maria@email.com</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>KYC Status</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Account Type</Text>
            <Text style={styles.statValue}>Freelancer</Text>
          </View>
        </View>

        <View style={styles.payoutInfo}>
          <Text style={styles.payoutLabel}>Payout</Text>
          <Text style={styles.payoutValue}>Banco de Chile ·•••4567</Text>
        </View>

        <View style={styles.settlementInfo}>
          <Text style={styles.settlementLabel}>Auto Settlement</Text>
          <Text style={styles.settlementValue}>Enabled</Text>
        </View>
      </Card>

      {/* Next Steps */}
      <View style={styles.nextSteps}>
        <Text style={styles.nextTitle}>Siguiente paso</Text>
        <Text style={styles.nextDesc}>Comparte tu link de cobro, envía una factura o explora el protocolo.</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title="Compartir enlace de cobro"
          onPress={() => {}}
          variant="tonal"
          fullWidth
          style={styles.actionBtn}
        />
        <Button
          title="Crear factura"
          onPress={() => {}}
          fullWidth
          style={styles.actionBtn}
        />
        <Button
          title="Explorar el Protocolo"
          onPress={() => router.replace('/(tabs)')}
          variant="outlined"
          fullWidth
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg, paddingTop: 80 },
  celebration: { alignItems: 'center', marginBottom: Spacing.xl },
  celebrationEmoji: { fontSize: 64, marginBottom: Spacing.md },
  title: { ...Typography.headlineLarge, color: Colors.onSurface, textAlign: 'center' },
  subtitle: { ...Typography.bodyLarge, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.sm },

  profileCard: { padding: Spacing.lg, alignItems: 'center', marginBottom: Spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { ...Typography.headlineLarge, color: Colors.onPrimaryContainer },
  profileName: { ...Typography.titleLarge, color: Colors.onSurface },
  profileEmail: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 2 },

  stats: { flexDirection: 'row', width: '100%', marginTop: Spacing.lg, gap: Spacing.lg },
  statItem: { flex: 1 },
  statLabel: { ...Typography.labelSmall, color: Colors.outline, marginBottom: 4 },
  statValue: { ...Typography.bodyMedium, color: Colors.onSurface },
  verifiedBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start' },
  verifiedText: { ...Typography.labelSmall, color: Colors.success },

  payoutInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.outlineVariant },
  payoutLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  payoutValue: { ...Typography.bodyMedium, color: Colors.onSurface },

  settlementInfo: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: Spacing.sm },
  settlementLabel: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant },
  settlementValue: { ...Typography.bodyMedium, color: Colors.success },

  nextSteps: { marginBottom: Spacing.xl },
  nextTitle: { ...Typography.titleMedium, color: Colors.onSurface, textAlign: 'center' },
  nextDesc: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: Spacing.xs },

  actions: { gap: Spacing.sm },
  actionBtn: { marginBottom: Spacing.xs },
});
