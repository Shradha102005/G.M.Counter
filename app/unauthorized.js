// app/unauthorized.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Unauthorized() {
  const { deviceId, error } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Background gradient effect using layered views */}
      <View style={styles.bgGradient} />

      {/* Card */}
      <View style={styles.card}>
        {/* Shield Icon Area */}
        <View style={styles.iconWrapper}>
          <Text style={styles.shieldIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>Access Denied</Text>

        <View style={styles.divider} />

        <Text style={styles.message}>
          This device is not authorized to use this application. Please contact
          the administrator.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Device Information</Text>
          <Text style={styles.infoText}>
            Device ID: <Text style={{ fontWeight: 'bold', color: '#fff' }}>{deviceId}</Text>
          </Text>
          <Text style={styles.infoText}>
            Status: <Text style={{ color: '#e74c3c' }}>{error}</Text>
          </Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>NUCLEONIX SYSTEMS PRIVATE LIMITED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#16213e',
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },

  card: {
    width: '90%',
    maxWidth: 480,
    backgroundColor: '#0f3460',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  shieldIcon: {
    fontSize: 48,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e74c3c',
    letterSpacing: 1,
    marginBottom: 16,
    fontFamily: 'sans-serif-medium',
  },

  divider: {
    width: '60%',
    height: 2,
    backgroundColor: 'rgba(231, 76, 60, 0.35)',
    borderRadius: 1,
    marginBottom: 20,
  },

  message: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
    fontFamily: 'sans-serif',
  },

  infoBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#2b78c5',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2b78c5',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    fontFamily: 'sans-serif',
  },

  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
  },
});
