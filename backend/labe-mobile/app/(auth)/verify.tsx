import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter as useExpoRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, fonts, rounded } from '../../src/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function VerifyScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useExpoRouter();
  const { email, phone } = useLocalSearchParams();
  const isEmail = !!email;

  const handleVerify = async () => {
    if (code.length !== 6 && code.length !== 8) return;
    setLoading(true);

    let authError = null;

    if (isEmail) {
      const { error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: code,
        type: 'magiclink',
      });
      authError = error;
    } else {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone as string,
        token: code,
        type: 'sms',
      });
      authError = error;
    }

    setLoading(false);

    if (authError) {
      Alert.alert('Verification Failed', authError.message);
    } else {
      // Successful verification automatically updates the Supabase session,
      // which our authStore will detect and route to the main app!
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={colors.deepSlate} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a code to {isEmail ? email : phone}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Code"
          placeholderTextColor={colors.slate500}
          keyboardType="number-pad"
          maxLength={8}
          value={code}
          onChangeText={setCode}
          autoFocus
        />

        <TouchableOpacity 
          style={[styles.continueBtn, (code.length === 6 || code.length === 8) ? styles.continueBtnActive : {}]}
          onPress={handleVerify}
          disabled={(code.length !== 6 && code.length !== 8) || loading}
        >
          <Text style={styles.continueBtnText}>{loading ? 'VERIFYING...' : 'VERIFY'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  headerRow: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  title: { ...fonts.headlineMd, color: colors.deepSlate, marginBottom: 8 },
  subtitle: { ...fonts.bodyMd, color: colors.slate500, marginBottom: 32 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.sapphire,
    ...fonts.headlineLg,
    color: colors.deepSlate,
    textAlign: 'center',
    paddingBottom: 12,
    marginBottom: 40,
    letterSpacing: 8,
  },
  continueBtn: {
    backgroundColor: colors.slate300,
    paddingVertical: 16, borderRadius: rounded.md,
    alignItems: 'center',
  },
  continueBtnActive: { backgroundColor: colors.sapphire },
  continueBtnText: { ...fonts.labelLg, color: colors.onPrimary, fontWeight: '800', letterSpacing: 0.5 },
});
