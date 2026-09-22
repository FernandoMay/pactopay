import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useWallet } from '@/components/wallet';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Header } from '@/components/Header';

export default function ProfileScreen() {
  const {
    isConnected,
    address,
    network,
    balance,
    connectWallet,
    disconnect,
  } = useWallet();

  const menuItems = [
    { icon: '👤', label: 'Datos personales', arrow: '→' },
    { icon: '🔐', label: 'Seguridad', arrow: '→' },
    { icon: '🔔', label: 'Notificaciones', arrow: '→' },
    { icon: '🌐', label: 'Idioma', value: 'Español', arrow: '→' },
    { icon: '💳', label: 'Métodos de pago', arrow: '→' },
    { icon: '📊', label: 'Historial de transacciones', arrow: '→' },
    { icon: '❓', label: 'Centro de ayuda', arrow: '→' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="Cuenta"
        isConnected={isConnected}
        address={isConnected ? address?.slice(0, 6) + '...' : undefined}
        network={network || 'testnet'}
        onConnect={connectWallet}
        onDisconnect={disconnect}
      />

      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.name}>María González</Text>
        <Text style={styles.email}>maria@email.com</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verificado</Text>
        </View>
      </Card>

      {/* Menu */}
      <Card style={styles.menuCard}>
        {menuItems.map((item, i) => (
          <Pressable key={i} style={[styles.menuItem, i < menuItems.length - 1 && styles.menuItemBorder]}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
            <Text style={styles.menuArrow}>{item.arrow}</Text>
          </Pressable>
        ))}
      </Card>

      {/* Logout */}
      <Pressable style={styles.logoutBtn}>
        <Text style={styles.logoutText}>🚪 Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },

  profileCard: { padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  avatarText: { ...Typography.displaySmall, color: Colors.onPrimaryContainer },
  name: { ...Typography.titleLarge, color: Colors.onSurface },
  email: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginTop: 2 },
  verifiedBadge: { backgroundColor: Colors.successLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: Spacing.sm },
  verifiedText: { ...Typography.labelMedium, color: Colors.success },

  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.outlineVariant },
  menuIcon: { fontSize: 20, marginRight: Spacing.md },
  menuLabel: { ...Typography.bodyLarge, color: Colors.onSurface, flex: 1 },
  menuValue: { ...Typography.bodyMedium, color: Colors.onSurfaceVariant, marginRight: Spacing.sm },
  menuArrow: { fontSize: 16, color: Colors.outline },

  logoutBtn: { marginTop: Spacing.xl, paddingVertical: Spacing.md, alignItems: 'center' },
  logoutText: { ...Typography.labelLarge, color: Colors.error },
});