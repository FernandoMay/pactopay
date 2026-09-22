import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { StepIndicator } from '@/components/StepIndicator';

export default function KYCScreen() {
  const [docType, setDocType] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header leftAction={{ icon: '←', onPress: () => router.back() }} />
      <StepIndicator steps={['Perfil', 'Identidad', 'Pago']} currentStep={1} />

      <Text style={styles.title}>KYC — Identity Verification</Text>
      <Text style={styles.subtitle}>Required by regulations. We verify your identity to activate your account.</Text>

      <Text style={styles.sectionTitle}>ID Document</Text>
      <View style={styles.docOptions}>
        {[
          { key: 'passport', label: 'Pasaporte', icon: '📘' },
          { key: 'drivers_license', label: 'Licencia de conducir', icon: '🪪' },
          { key: 'national_id', label: 'ID Nacional', icon: '🪪' },
          { key: 'residence_permit', label: 'Permiso de residencia', icon: '📄' },
        ].map((doc) => (
          <Pressable
            key={doc.key}
            style={[styles.docCard, docType === doc.key && styles.docCardActive]}
            onPress={() => setDocType(doc.key)}
          >
            <Text style={styles.docIcon}>{doc.icon}</Text>
            <Text style={[styles.docLabel, docType === doc.key && styles.docLabelActive]}>{doc.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Verification method</Text>
      <View style={styles.methodCards}>
        <View style={styles.methodCard}>
          <Text style={styles.methodIcon}>📸</Text>
          <Text style={styles.methodLabel}>Automatic verification</Text>
          <Text style={styles.methodDesc}>Instant using biometric verification</Text>
        </View>
        <View style={styles.methodCard}>
          <Text style={styles.methodIcon}>🎥</Text>
          <Text style={styles.methodLabel}>Video verification</Text>
          <Text style={styles.methodDesc}>Scheduled video call, usually within 10 minutes</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Biometric verification</Text>
      <Text style={styles.biometricDesc}>We use liveness detection — you will receive a code, then open your device's camera for 5-10 seconds.</Text>

      <View style={styles.idUpload}>
        <View style={styles.idFront}>
          <Text style={styles.idPlaceholder}>📁 ID Front</Text>
          <Text style={styles.idHint}>Upload your ID photo</Text>
        </View>
        <View style={styles.idBack}>
          <Text style={styles.idPlaceholder}>📁 ID Back</Text>
          <Text style={styles.idHint}>Upload your ID photo</Text>
        </View>
      </View>

      <Button
        title="Continue"
        onPress={() => router.push('/(onboarding)/payout')}
        fullWidth
        style={styles.continueBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  title: { ...Typography.headlineSmall, color: Colors.onSurface, marginTop: Spacing.md, marginBottom: Spacing.xs },
  subtitle: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.titleSmall, color: Colors.onSurfaceVariant, marginTop: Spacing.lg, marginBottom: Spacing.md },

  docOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  docCard: { width: '47%', borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, padding: Spacing.md, alignItems: 'center' },
  docCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  docIcon: { fontSize: 28, marginBottom: Spacing.xs },
  docLabel: { ...Typography.labelLarge, color: Colors.onSurface },
  docLabelActive: { color: Colors.onPrimaryContainer },

  methodCards: { gap: Spacing.sm },
  methodCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, padding: Spacing.md },
  methodIcon: { fontSize: 24, marginRight: Spacing.md },
  methodLabel: { ...Typography.titleSmall, color: Colors.onSurface, flex: 1 },
  methodDesc: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  biometricDesc: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginBottom: Spacing.lg },

  idUpload: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  idFront: { flex: 1, height: 120, borderWidth: 2, borderColor: Colors.outlineVariant, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  idBack: { flex: 1, height: 120, borderWidth: 2, borderColor: Colors.outlineVariant, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  idPlaceholder: { ...Typography.bodyMedium, color: Colors.outline },
  idHint: { ...Typography.bodySmall, color: Colors.outline, marginTop: 4 },

  continueBtn: { marginTop: Spacing.lg },
});
