import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: { icon: string; onPress: () => void };
  rightAction?: { icon: string; onPress: () => void };
  showBreadline?: boolean;
  isConnected?: boolean;
  address?: string;
  network?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function Header({ title, subtitle, leftAction, rightAction, showBreadline, isConnected, address, network, onConnect, onDisconnect }: HeaderProps) {
  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Conectar';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction && (
          <Pressable onPress={leftAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{leftAction.icon}</Text>
          </Pressable>
        )}

        <View style={styles.titleArea}>
          {showBreadline && (
            <View style={styles.brandRow}>
              <View style={styles.breadline}>
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#006c4a' }]} />
                <View style={[styles.breadDot, { backgroundColor: '#00236f' }]} />
              </View>
              <Text style={styles.brand}>BREADLINE</Text>
            </View>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {rightAction && (
          <Pressable onPress={rightAction.onPress} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>{rightAction.icon}</Text>
          </Pressable>
        )}

        {/* Wallet status in app bar */}
        {isConnected ? (
          <View style={styles.walletConnector}>
            <Text style={styles.walletAddress}>{displayAddress}</Text>
            <Text style={styles.walletNetwork}>•{network || 'testnet'}</Text>
            <Pressable onPress={onDisconnect} style={styles.disconnectBtn}>
              <Text style={styles.disconnectText}>X</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onConnect} style={styles.connectBtn}>
            <Text style={styles.connectText}>Conectar Wallet</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fdfcff',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  titleArea: { flex: 1 },

  actionBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  breadline: { flexDirection: 'row', gap: 3, marginRight: 6 },
  breadDot: { width: 8, height: 8, borderRadius: 4 },
  brand: { fontSize: 10, color: '#888', letterSpacing: 2 },

  title: { fontSize: 18, color: '#1b1b1f' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  actionIcon: { fontSize: 20, color: '#1b1b1f' },

  /* Wallet connector styles */
  walletConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  walletAddress: { fontSize: 12, color: '#1b1b1f', marginRight: 4 },
  walletNetwork: { fontSize: 10, color: '#767680', marginRight: 8 },
  disconnectBtn: { padding: 4, alignItems: 'center' },
  disconnectText: { fontSize: 10, color: '#ba1a1a' },
  connectBtn: {
    backgroundColor: '#00236f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginLeft: 16,
  },
  connectText: { fontSize: 12, color: '#fff' },
});