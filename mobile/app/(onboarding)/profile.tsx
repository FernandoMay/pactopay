import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Input, Select } from '@/components/Input';
import { Button } from '@/components/Button';
import { StepIndicator } from '@/components/StepIndicator';

export default function ProfileScreen() {
  const [entityType, setEntityType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        leftAction={{ icon: '←', onPress: () => router.back() }}
      />

      <StepIndicator steps={['Perfil', 'Identidad', 'Pago']} currentStep={0} />

      <Text style={styles.title}>Crea tu perfil de contratista o contratista</Text>

      <Text style={styles.sectionTitle}>Profile Type</Text>
      <View style={styles.radioGroup}>
        {[
          { key: 'individual', label: 'Individual', desc: 'Freelancer, contratista independiente', icon: '👤' },
          { key: 'business', label: 'Business', desc: 'Agencia, equipo o empresa', icon: '🏢' },
        ].map((opt) => (
          <View
            key={opt.key}
            style={[styles.radioCard, entityType === opt.key && styles.radioCardActive]}
          >
            <Text style={styles.radioIcon}>{opt.icon}</Text>
            <View style={styles.radioContent}>
              <Text style={styles.radioLabel}>{opt.label}</Text>
              <Text style={styles.radioDesc}>{opt.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Personal Information</Text>
      <Input label="First name" value={firstName} onChangeText={setFirstName} placeholder="Enter your first name" />
      <Input label="Last name" value={lastName} onChangeText={setLastName} placeholder="Enter your last name" />
      <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" icon="📧" />
      <Input label="Phone number" value={phone} onChangeText={setPhone} placeholder="+52 55 1234 5678" keyboardType="phone-pad" icon="📱" />
      <Select label="Country of residence" value={country} onValueChange={setCountry} options={[]} placeholder="Select country" />

      <Text style={styles.legal}>Your information is encrypted end-to-end.</Text>
      <Text style={styles.legal}>By creating an account you agree to the Terms of Service.</Text>

      <Button
        title="Continue"
        onPress={() => router.push('/(onboarding)/kyc')}
        fullWidth
        style={styles.continueBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  title: { ...Typography.headlineSmall, color: Colors.onSurface, marginTop: Spacing.md, marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.titleSmall, color: Colors.onSurfaceVariant, marginTop: Spacing.lg, marginBottom: Spacing.md },

  radioGroup: { gap: Spacing.sm },
  radioCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, padding: Spacing.md },
  radioCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  radioIcon: { fontSize: 24, marginRight: Spacing.md },
  radioContent: { flex: 1 },
  radioLabel: { ...Typography.titleSmall, color: Colors.onSurface },
  radioDesc: { ...Typography.bodySmall, color: Colors.onSurfaceVariant },

  legal: { ...Typography.bodySmall, color: Colors.outline, marginTop: Spacing.sm },
  continueBtn: { marginTop: Spacing.xl },
});
