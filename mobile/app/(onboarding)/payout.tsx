import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Input, Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { StepIndicator } from '@/components/StepIndicator';

export default function PayoutScreen() {
  const [autoSettlement, setAutoSettlement] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header leftAction={{ icon: '←', onPress: () => router.back() }} />
      <StepIndicator steps={['Perfil', 'Identidad', 'Pago']} currentStep={2} />

      <Text style={styles.title}>Payout routing & auto-settlement</Text>
      <Text style={styles.subtitle}>Set up how you want to get paid and enable auto-settlement for instant USDC withdrawal.</Text>

      {/* Payout Method */}
      <Text style={styles.sectionTitle}>Payout Method</Text>
      <View style={styles.payoutMethods}>
        {[
          { key: 'bank', label: 'Transferencia bancaria', icon: '🏦', desc: 'USD wire or local transfer' },
          { key: 'crypto', label: 'Crypto wallet', icon: '💎', desc: 'USDC on Stellar' },
        ].map((method) => (
          <View
            key={method.key}
            style={[styles.payoutCard, payoutMethod === method.key && styles.payoutCardActive]}
          >
            <Text style={styles.payoutIcon}>{method.icon}</Text>
            <View style={styles.payoutContent}>
              <Text style={styles.payoutLabel}>{method.label}</Text>
              <Text style={styles.payoutDesc}>{method.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bank Details */}
      <Input label="Bank name" value={bankName} onChangeText={setBankName} placeholder="e.g. Banco de Chile" icon="🏦" />
      <Input label="Routing number" value={routingNumber} onChangeText={setRoutingNumber} placeholder="e.g. 110000000" icon="🔢" />
      <Input label="Account number" value={accountNumber} onChangeText={setAccountNumber} placeholder="••••••••••" secureTextEntry icon="🔒" />

      {/* Auto Settlement */}
      <View style={styles.settlementRow}>
        <View style={styles.settlementContent}>
          <Text style={styles.settlementLabel}>Auto-settlement</Text>
          <Text style={styles.settlementDesc}>Withdraw USDC instantly when milestones are released</Text>
        </View>
        <Switch
          value={autoSettlement}
          onValueChange={setAutoSettlement}
          trackColor={{ false: Colors.outlineVariant, true: Colors.secondaryContainer }}
          thumbColor={autoSettlement ? Colors.secondary : Colors.outline}
        />
      </View>

      <Button
        title="Continue"
        onPress={() => router.push('/(onboarding)/success')}
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

  payoutMethods: { gap: Spacing.sm, marginBottom: Spacing.lg },
  payoutCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, padding: Spacing.md },
  payoutCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  payoutIcon: { fontSize: 24, marginRight: Spacing.md },
  payoutContent: { flex: 1 },
  payoutLabel: { ...Typography.titleSmall, color: Colors.onSurface },
  payoutDesc: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  settlementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.lg, paddingVertical: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.outlineVariant },
  settlementContent: { flex: 1, marginRight: Spacing.md },
  settlementLabel: { ...Typography.titleMedium, color: Colors.onSurface },
  settlementDesc: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  continueBtn: { marginTop: Spacing.xl },
});
