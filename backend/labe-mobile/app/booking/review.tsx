import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, User, Calendar, MapPin, Activity, Building2 } from 'lucide-react-native';
import { colors, fonts, spacing } from '../../src/theme';

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    // Simulate booking API
    setTimeout(() => {
      setLoading(false);
      router.push('/booking/confirmation');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={loading}>
          <ArrowLeft color={colors.deepSlate} size={24} />
        </TouchableOpacity>
        <View style={styles.appBarTitleWrap}>
          <Text style={styles.appBarTitle}>Review Order</Text>
          <Text style={styles.appBarSubtitle}>Step 3 of 3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Test & Lab Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Details</Text>
          <View style={styles.row}>
            <Activity color={colors.slate500} size={20} />
            <Text style={styles.rowText}>Test ID: {params.testId}</Text>
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Building2 color={colors.slate500} size={20} />
            <Text style={styles.rowText}>Lab ID: {params.labId}</Text>
          </View>
        </View>

        {/* Calendar Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Calendar</Text>
          <View style={styles.row}>
            <Calendar color={colors.slate500} size={20} />
            <Text style={styles.rowText}>{params.date} at {params.time}</Text>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient Details</Text>
          <View style={styles.row}>
            <User color={colors.slate500} size={20} />
            <Text style={styles.rowText}>{params.patientName}, {params.patientAge} yrs, {params.patientGender}</Text>
          </View>
          {params.method === 'home' && (
            <View style={[styles.row, { marginTop: 12, alignItems: 'flex-start' }]}>
              <MapPin color={colors.slate500} size={20} />
              <Text style={[styles.rowText, { flex: 1 }]}>{params.patientAddress}</Text>
            </View>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Test Price</Text>
            <Text style={styles.priceValue}>₹350</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{params.method === 'home' ? 'Home Collection' : 'Lab Visit'}</Text>
            <Text style={styles.priceValue}>{params.method === 'home' ? '₹0' : '₹0'}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹350</Text>
          </View>
          <Text style={styles.paymentMethod}>To be paid at time of collection</Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleConfirm} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text style={styles.primaryBtnText}>Confirm Booking</Text>
              <CheckCircle2 color={colors.onPrimary} size={20} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1, borderBottomColor: colors.slate300,
  },
  backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
  appBarTitleWrap: { flex: 1 },
  appBarTitle: { ...fonts.headlineMd, color: colors.deepSlate },
  appBarSubtitle: { ...fonts.bodySm, color: colors.sapphire },

  scrollContent: { padding: 16, paddingBottom: 100, gap: 16 },
  
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: colors.slate300,
  },
  cardTitle: { ...fonts.labelLg, color: colors.deepSlate, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { ...fonts.bodyMd, color: colors.slate700 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { ...fonts.bodyMd, color: colors.slate500 },
  priceValue: { ...fonts.labelMd, color: colors.deepSlate },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.slate300 },
  totalLabel: { ...fonts.labelLg, color: colors.deepSlate },
  totalValue: { ...fonts.headlineMd, color: colors.sapphire },
  paymentMethod: { ...fonts.labelSm, color: colors.emeraldDark, marginTop: 12, textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: 8, borderRadius: 8 },

  footer: {
    padding: 16, backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1, borderTopColor: colors.slate300,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.sapphire, paddingVertical: 16,
    borderRadius: 12, gap: 8
  },
  primaryBtnText: { ...fonts.labelLg, color: colors.onPrimary },
});
