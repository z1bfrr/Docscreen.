import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Dimensions, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter as useExpoRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { colors, fonts, rounded } from '../../src/theme';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';

// To handle OAuth flow properly in React Native
WebBrowser.maybeCompleteAuthSession();

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const [inputValue, setInputValue] = useState('');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
  const [loading, setLoading] = useState(false);
  const router = useExpoRouter();

  const handleSendOtp = async () => {
    setLoading(true);
    let authError = null;

    if (loginMethod === 'email') {
      if (!inputValue.includes('@') || !inputValue.includes('.')) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: inputValue.toLowerCase().trim(),
      });
      authError = error;
    } else {
      if (inputValue.length !== 10) {
        setLoading(false);
        return;
      }
      const formattedPhone = `+91${inputValue}`;
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });
      authError = error;
    }

    setLoading(false);

    if (authError) {
      Alert.alert('Error', authError.message);
    } else {
      router.push({
        pathname: '/(auth)/verify',
        params: {
          email: loginMethod === 'email' ? inputValue.toLowerCase().trim() : '',
          phone: loginMethod === 'phone' ? `+91${inputValue}` : ''
        }
      });
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    // Linking.createURL guarantees an exp:// URL in Expo Go, and a labe:// URL in production
    const redirectUrl = Linking.createURL('');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      Alert.alert('OAuth Error', error.message);
      return;
    }

    if (data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      if (res.type === 'success' && res.url) {
        supabase.auth.getSessionFromUrl({ url: res.url });
      }
    }
  };

  const isInputValid = loginMethod === 'phone' ? inputValue.length === 10 : inputValue.length > 4;

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}></View>

          <View style={styles.brandContent}>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 24 }} resizeMode="contain" />
            </View>
            <Text style={styles.heroText}>
              One app for tests,{'\n'}packages, scans{'\n'}and more in mins!
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetWrap}>
        <View style={styles.bottomSheet}>
          <Text style={styles.loginTitle}>Login</Text>
          <Text style={styles.loginSubtitle}>
            Enter your {loginMethod === 'phone' ? 'phone number' : 'email address'} to proceed
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.countryCode}>
              {loginMethod === 'phone' ? (
                <>
                  <Text style={styles.flagText}>🇮🇳</Text>
                  <Text style={styles.codeText}>+91</Text>
                </>
              ) : (
                <Mail color={colors.slate500} size={20} />
              )}
            </View>
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.input}
              placeholder={loginMethod === 'phone' ? "Mobile Number" : "name@example.com"}
              placeholderTextColor={colors.slate500}
              keyboardType={loginMethod === 'phone' ? "phone-pad" : "email-address"}
              maxLength={loginMethod === 'phone' ? 10 : undefined}
              autoCapitalize="none"
              value={inputValue}
              onChangeText={setInputValue}
            />
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, isInputValid ? styles.continueBtnActive : {}]}
            onPress={handleSendOtp}
            disabled={!isInputValid || loading}
          >
            <Text style={styles.continueBtnText}>{loading ? 'SENDING...' : 'CONTINUE'}</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuth('google')}>
              <FontAwesome5 name="google" size={20} color="#DB4437" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={() => handleOAuth('apple')}>
              <FontAwesome5 name="apple" size={24} color="#000000" style={{ marginTop: -2 }} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={() => {
              setLoginMethod(loginMethod === 'phone' ? 'email' : 'phone');
              setInputValue('');
            }}>
              {loginMethod === 'phone' ? (
                <Mail color={colors.slate700} size={20} />
              ) : (
                <FontAwesome5 name="phone" size={18} color={colors.slate700} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By clicking, I accept the <Text style={styles.termsLink}>Privacy policy</Text>,{'\n'}
            <Text style={styles.termsLink}>LabE terms of use</Text> and <Text style={styles.termsLink}>Partner terms of use</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sapphire },

  topSection: { flex: 1 },
  headerRow: { paddingHorizontal: 16, paddingVertical: 12, height: 48 },
  brandContent: { alignItems: 'center', marginTop: height * 0.05 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.surfaceContainerLowest,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5
  },
  heroText: {
    ...fonts.headlineLg, color: colors.onPrimary,
    textAlign: 'center', lineHeight: 40,
    paddingHorizontal: 32
  },

  bottomSheetWrap: { justifyContent: 'flex-end' },
  bottomSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40,
  },

  loginTitle: { ...fonts.headlineMd, color: colors.deepSlate, marginBottom: 4 },
  loginSubtitle: { ...fonts.bodyMd, color: colors.slate500, marginBottom: 24 },

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.slate300,
    paddingBottom: 8, marginBottom: 24,
  },
  countryCode: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 12 },
  flagText: { fontSize: 20 },
  codeText: { ...fonts.labelLg, color: colors.deepSlate },
  inputDivider: { width: 1, height: 24, backgroundColor: colors.slate300, marginRight: 12 },
  input: { flex: 1, ...fonts.labelLg, color: colors.deepSlate, padding: 0 },

  continueBtn: {
    backgroundColor: colors.slate300,
    paddingVertical: 16, borderRadius: rounded.md,
    alignItems: 'center', marginBottom: 24
  },
  continueBtnActive: { backgroundColor: colors.sapphire },
  continueBtnText: { ...fonts.labelLg, color: colors.onPrimary, fontWeight: '800', letterSpacing: 0.5 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.slate300 },
  dividerText: { ...fonts.labelSm, color: colors.slate500, paddingHorizontal: 12 },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
  socialBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.slate300,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
  },

  termsText: { ...fonts.bodySm, color: colors.slate500, textAlign: 'center', lineHeight: 20 },
  termsLink: { fontWeight: '700', color: colors.deepSlate, textDecorationLine: 'underline' },
});
