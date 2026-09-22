import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { StepIndicator } from '@/components/StepIndicator';
import { FeeBreakdown } from '@/components/FeeBreakdown';

export default function CreateEscrowScreen() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [deadline, setDeadline] = useState('');

  const steps = ['Detalles', 'Monto', 'Confirmar'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="Crear depósito" subtitle="Protege el pago para servicios o productos." />

      <StepIndicator steps={steps} currentStep={step} />

      {step === 0 && (
        <>
          <Input label="Título" value={title} onChangeText={setTitle} placeholder="Desarrollador Full Stack" icon="📄" />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Describe el alcance del trabajo..." />
          <Input label="Para (wallet o email)" value={recipient} onChangeText={setRecipient} placeholder="stellar:GA5... o email" icon="👤" />
          <Input label="Fecha límite" value={deadline} onChangeText={setDeadline} placeholder="2026-03-01" icon="📅" />
        </>
      )}

      {step === 1 && (
        <>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Monto del depósito</Text>
            <Text style={styles.amountHint}>Este monto será retenido hasta la validación.</Text>
          </View>
          <Input label="Monto" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" icon="💰" />
          <FeeBreakdown
            subtotal={amount || '0.00'}
            platformFee={amount ? (parseFloat(amount) * 0.02).toFixed(2) : '0.00'}
            networkFee="0.0001"
            total={amount ? (parseFloat(amount) * 1.02).toFixed(2) : '0.00'}
          />
        </>
      )}

      {step === 2 && (
        <View style={styles.confirmSection}>
          <Text style={styles.confirmTitle}>Confirmar depósito</Text>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmLabel}>Título</Text>
            <Text style={styles.confirmValue}>{title || 'Sin título'}</Text>
            <Text style={styles.confirmLabel}>Monto</Text>
            <Text style={styles.confirmValue}>{amount || '0.00'} USDC</Text>
            <Text style={styles.confirmLabel}>Para</Text>
            <Text style={styles.confirmValue}>{recipient || 'No especificado'}</Text>
            <Text style={styles.confirmLabel}>Fecha límite</Text>
            <Text style={styles.confirmValue}>{deadline || 'Sin fecha'}</Text>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        {step > 0 && (
          <Button title="Atrás" onPress={() => setStep(step - 1)} variant="outlined" style={styles.backBtn} />
        )}
        {step < 2 ? (
          <Button title="Siguiente" onPress={() => setStep(step + 1)} fullWidth />
        ) : (
          <Button title="Depositar en custodia" onPress={() => {}} fullWidth />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  amountSection: { marginBottom: Spacing.lg },
  amountLabel: { ...Typography.headlineSmall, color: Colors.onSurface },
  amountHint: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 4 },

  confirmSection: { marginBottom: Spacing.lg },
  confirmTitle: { ...Typography.titleLarge, color: Colors.onSurface, marginBottom: Spacing.md },
  confirmCard: { backgroundColor: Colors.surfaceVariant, borderRadius: 16, padding: Spacing.lg },
  confirmLabel: { ...Typography.labelSmall, color: Colors.outline, marginTop: Spacing.sm },
  confirmValue: { ...Typography.bodyLarge, color: Colors.onSurface },

  actions: { marginTop: Spacing.xl },
  backBtn: { marginBottom: Spacing.sm },
});
