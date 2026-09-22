import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function OnboardingStart() {
  return (
    <View style={styles.container}>
      {/* Brand Header */}
      <View style={styles.header}>
        <View style={styles.breadline}>
          <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
          <View style={[styles.breadDot, { backgroundColor: '#006c4a' }]} />
          <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
        </View>
        <Text style={styles.brand}>BREADLINE</Text>
      </View>

      {/* Value Props */}
      <View style={styles.props}>
        {[
          { icon: '🏦', text: 'Cuenta equipolente a la banca tradicional' },
          { icon: '⚡', text: 'Pagos instantáneos en 3 a 5 segundos' },
          { icon: '💰', text: 'Financiamiento o facilitación con garantía' },
          { icon: '🌐', text: 'Accesible desde cualquier parte del mundo' },
        ].map((prop, i) => (
          <View key={i} style={styles.propRow}>
            <Text style={styles.propIcon}>{prop.icon}</Text>
            <Text style={styles.propText}>{prop.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push('/(onboarding)/profile')}
        >
          <Text style={styles.ctaText}>Open your account →</Text>
        </Pressable>
      </View>

      {/* Role Selector */}
      <View style={styles.roleSection}>
        <Text style={styles.roleTitle}>¿Qué buscas?</Text>
        <View style={styles.roleCards}>
          <Pressable
            style={styles.roleCard}
            onPress={() => router.push('/(onboarding)/profile')}
          >
            <Text style={styles.roleEmoji}>💼</Text>
            <Text style={styles.roleLabel}>Freelancer</Text>
            <Text style={styles.roleDesc}>Cobra por entregables, mantén pagos</Text>
          </Pressable>
          <Pressable
            style={styles.roleCard}
            onPress={() => router.push('/(onboarding)/profile')}
          >
            <Text style={styles.roleEmoji}>🏢</Text>
            <Text style={styles.roleLabel}>Contratista</Text>
            <Text style={styles.roleDesc}>Financia entregables seguros</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 60, marginBottom: Spacing.xxxl },
  breadline: { flexDirection: 'row', gap: 3, marginRight: 6 },
  breadDot: { width: 8, height: 8, borderRadius: 4 },
  brand: { ...Typography.labelSmall, color: Colors.onSurfaceVariant, letterSpacing: 2 },

  props: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxl },
  propRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  propIcon: { fontSize: 24, marginRight: Spacing.md },
  propText: { ...Typography.bodyLarge, color: Colors.onSurface, flex: 1 },

  ctaSection: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xxxl },
  ctaButton: { backgroundColor: Colors.secondary, paddingVertical: Spacing.md, borderRadius: 24, alignItems: 'center' },
  ctaText: { ...Typography.labelLarge, color: Colors.onSecondary },

  roleSection: { paddingHorizontal: Spacing.xl },
  roleTitle: { ...Typography.headlineSmall, color: Colors.onSurface, textAlign: 'center', marginBottom: Spacing.lg },
  roleCards: { flexDirection: 'row', gap: Spacing.md },
  roleCard: { flex: 1, backgroundColor: Colors.primaryContainer, borderRadius: 16, padding: Spacing.lg, alignItems: 'center' },
  roleEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  roleLabel: { ...Typography.titleMedium, color: Colors.onPrimaryContainer },
  roleDesc: { ...Typography.bodySmall, color: Colors.onPrimaryContainer, textAlign: 'center', marginTop: 4 },
});
