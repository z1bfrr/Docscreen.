import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CheckCircle2, Home, FileText } from 'lucide-react-native';
import { colors, fonts, spacing } from '../../src/theme';

export default function ConfirmationScreen() {
  const router = useRouter();
  
  // Generate a random booking ID for the mock
  const bookingId = Math.floor(100000 + Math.random() * 900000).toString();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <CheckCircle2 color={colors.emerald} size={80} />
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your appointment has been successfully scheduled.</Text>
        
        <View style={styles.idBox}>
          <Text style={styles.idLabel}>Booking ID</Text>
          <Text style={styles.idValue}>#{bookingId}</Text>
        </View>
        
        <Text style={styles.instructions}>
          You will receive a confirmation message on your registered mobile number shortly.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.navigate('/(tabs)')}>
          <Home color={colors.sapphire} size={20} />
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.navigate('/(tabs)/orders')}>
          <FileText color={colors.onPrimary} size={20} />
          <Text style={styles.primaryBtnText}>View Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.gutter,
  },
  iconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  title: { ...fonts.headlineLg, color: colors.deepSlate, marginBottom: 8, textAlign: 'center' },
  subtitle: { ...fonts.bodyMd, color: colors.slate500, textAlign: 'center', marginBottom: 32 },
  
  idBox: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 24, paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1, borderColor: colors.slate300,
    alignItems: 'center', gap: 4,
    marginBottom: 24,
  },
  idLabel: { ...fonts.labelMd, color: colors.slate500 },
  idValue: { ...fonts.headlineMd, color: colors.sapphire },
  
  instructions: { ...fonts.bodySm, color: colors.slate500, textAlign: 'center', paddingHorizontal: 32 },

  footer: {
    padding: 16, gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1, borderTopColor: colors.slate300,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.sapphire, paddingVertical: 16,
    borderRadius: 12, gap: 8
  },
  primaryBtnText: { ...fonts.labelLg, color: colors.onPrimary },
  
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow, paddingVertical: 16,
    borderRadius: 12, gap: 8
  },
  secondaryBtnText: { ...fonts.labelLg, color: colors.sapphire },
});
