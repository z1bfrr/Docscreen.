import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { colors, fonts, spacing, rounded } from '../../src/theme';

export default function PatientScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | null>(null);
  const [address, setAddress] = useState('');

  const isHomeCollection = params.method === 'home';
  
  const isValid = name.trim() !== '' && age.trim() !== '' && gender !== null && (!isHomeCollection || address.trim() !== '');

  const handleNext = () => {
    if (!isValid) return;
    router.push({
      pathname: '/booking/review',
      params: { ...params, patientName: name, patientAge: age, patientGender: gender, patientAddress: address }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft color={colors.deepSlate} size={24} />
          </TouchableOpacity>
          <View style={styles.appBarTitleWrap}>
            <Text style={styles.appBarTitle}>Patient Details</Text>
            <Text style={styles.appBarSubtitle}>Step 2 of 3</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.slate500}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 35"
                placeholderTextColor={colors.slate500}
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={3}
              />
            </View>
            <View style={[styles.formGroup, { flex: 2 }]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female'].map((g) => (
                  <TouchableOpacity 
                    key={g}
                    style={[styles.genderChip, gender === g && styles.genderChipActive]}
                    onPress={() => setGender(g as any)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {isHomeCollection && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Collection Address</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Enter complete address for home collection"
                placeholderTextColor={colors.slate500}
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.primaryBtn, !isValid && styles.primaryBtnDisabled]} 
            onPress={handleNext}
            disabled={!isValid}
          >
            <Text style={styles.primaryBtnText}>Review Booking</Text>
            <ArrowRight color={colors.onPrimary} size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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

  scrollContent: { padding: 16, paddingBottom: 100 },
  
  formGroup: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 16 },
  label: { ...fonts.labelMd, color: colors.deepSlate, marginBottom: 8 },
  input: {
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.slate300,
    borderRadius: 12, paddingHorizontal: 16,
    ...fonts.bodyMd, color: colors.deepSlate
  },

  genderRow: { flexDirection: 'row', gap: 8, height: 52 },
  genderChip: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.slate300,
    borderRadius: 12, backgroundColor: colors.surfaceContainerLowest,
  },
  genderChipActive: { backgroundColor: colors.sapphire, borderColor: colors.sapphire },
  genderText: { ...fonts.labelMd, color: colors.slate700 },
  genderTextActive: { color: colors.onPrimary },

  footer: {
    padding: 16, backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1, borderTopColor: colors.slate300,
  },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.sapphire, paddingVertical: 16,
    borderRadius: 12, gap: 8
  },
  primaryBtnDisabled: { backgroundColor: colors.slate300 },
  primaryBtnText: { ...fonts.labelLg, color: colors.onPrimary },
});
