import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, Alert, Clipboard, ScrollView } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      const stored = await SecureStore.getItemAsync('biometrics_enabled');
      setIsBiometricEnabled(stored === 'true');
    })();
  }, []);

  const handleBiometricsToggle = async (value: boolean) => {
    if (!isBiometricSupported) {
      Alert.alert('Unsupported', 'Biometrics hardware is not available on this device');
      return;
    }

    if (value) {
      // Trigger biometrics verification to authenticate enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm biometrics authentication to enable Face ID / Touch ID login',
      });

      if (result.success) {
        await SecureStore.setItemAsync('biometrics_enabled', 'true');
        setIsBiometricEnabled(true);
        Alert.alert('Success', 'Face ID / Touch ID authentication enabled successfully');
      } else {
        setIsBiometricEnabled(false);
      }
    } else {
      await SecureStore.setItemAsync('biometrics_enabled', 'false');
      setIsBiometricEnabled(false);
      Alert.alert('Deactivated', 'Biometrics auth disabled');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const handleSignOut = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    Alert.alert('Signed Out', 'You have been successfully logged out of FundOS');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trader Profile</Text>

      {/* User Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>Joshua Omatsuli</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>joshua@fundos.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Organization</Text>
          <Text style={styles.infoValue}>FundOS Proprietary</Text>
        </View>
      </View>

      {/* Simulated Platform Credentials */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trading Platform Credentials</Text>
        <Text style={styles.description}>Use these details to log in to your MT5 or cTrader app.</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Server</Text>
          <Text style={styles.infoValue}>FundOS-Demo-Server</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Login</Text>
          <Text style={styles.infoValue}>1029482</Text>
        </View>

        {showCredentials ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Password</Text>
              <Text style={styles.infoValue}>tG9#x1zL</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Investor Pwd</Text>
              <Text style={styles.infoValue}>tG9#x1zLInv</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyToClipboard('1029482', 'Login')}>
                <Text style={styles.actionBtnText}>Copy Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => copyToClipboard('tG9#x1zL', 'Password')}>
                <Text style={styles.actionBtnText}>Copy Pwd</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.revealBtn} onPress={() => setShowCredentials(true)}>
            <Text style={styles.revealBtnText}>Reveal Passwords</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Security Preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Security & Biometrics</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Native Biometrics Login</Text>
            <Text style={styles.switchSub}>Enable Face ID or Touch ID</Text>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleBiometricsToggle}
            trackColor={{ false: '#2C2C2E', true: '#0A84FF' }}
            thumbColor={'#FFFFFF'}
          />
        </View>
      </View>

      {/* Sign Out Action */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    marginTop: 40,
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  infoLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  switchSub: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionBtn: {
    flex: 0.48,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  revealBtn: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  revealBtnText: {
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 14,
  },
  signOutBtn: {
    backgroundColor: '#FF453A',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
