import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Home, Building2, Calendar, Clock, ArrowRight } from 'lucide-react-native';
import { colors, fonts, spacing, rounded } from '../../src/theme';

export default function ScheduleScreen() {
  const router = useRouter();
  const { testId, labId } = useLocalSearchParams();
  const [method, setMethod] = useState<'home' | 'lab'>('home');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('08:00 AM');

  const dates = ['Today', 'Tomorrow', 'Oct 24', 'Oct 25', 'Oct 26'];
  const times = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'];

  const handleNext = () => {
    router.push({
      pathname: '/booking/patient',
      params: { testId, labId, method, date: selectedDate, time: selectedTime }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.deepSlate} size={24} />
        </TouchableOpacity>
        <View style={styles.appBarTitleWrap}>
          <Text style={styles.appBarTitle}>Calendar Appointment</Text>
          <Text style={styles.appBarSubtitle}>Step 1 of 3</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>Collection Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity 
            style={[styles.methodCard, method === 'home' && styles.methodCardActive]}
            onPress={() => setMethod('home')}
          >
            <Home color={method === 'home' ? colors.sapphire : colors.slate500} size={24} />
            <Text style={[styles.methodText, method === 'home' && styles.methodTextActive]}>Home Collection</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.methodCard, method === 'lab' && styles.methodCardActive]}
            onPress={() => setMethod('lab')}
          >
            <Building2 color={method === 'lab' ? colors.sapphire : colors.slate500} size={24} />
            <Text style={[styles.methodText, method === 'lab' && styles.methodTextActive]}>Visit Lab</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {dates.map(date => (
            <TouchableOpacity 
              key={date}
              style={[styles.chip, selectedDate === date && styles.chipActive]}
              onPress={() => setSelectedDate(date)}
            >
              {selectedDate === date && <Calendar color={colors.onPrimary} size={14} style={{marginRight:4}} />}
              <Text style={[styles.chipText, selectedDate === date && styles.chipTextActive]}>{date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Select Time</Text>
        <View style={styles.timeGrid}>
          {times.map(time => (
            <TouchableOpacity 
              key={time}
              style={[styles.timeChip, selectedTime === time && styles.timeChipActive]}
              onPress={() => setSelectedTime(time)}
            >
              {selectedTime === time && <Clock color={colors.onPrimary} size={14} style={{marginRight:4}} />}
              <Text style={[styles.timeChipText, selectedTime === time && styles.timeChipTextActive]}>{time}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleNext}>
          <Text style={styles.primaryBtnText}>Continue to Patient Details</Text>
          <ArrowRight color={colors.onPrimary} size={20} />
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

  scrollContent: { padding: 16, paddingBottom: 100 },
  
  sectionTitle: { ...fonts.labelLg, color: colors.deepSlate, marginBottom: 12 },
  
  methodRow: { flexDirection: 'row', gap: 12 },
  methodCard: {
    flex: 1, padding: 16, borderRadius: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2, borderColor: colors.slate300,
    alignItems: 'center', gap: 8
  },
  methodCardActive: { borderColor: colors.sapphire, backgroundColor: colors.sapphireLight },
  methodText: { ...fonts.labelMd, color: colors.slate700 },
  methodTextActive: { color: colors.sapphire },

  hScroll: { gap: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.slate300,
  },
  chipActive: { backgroundColor: colors.sapphire, borderColor: colors.sapphire },
  chipText: { ...fonts.labelMd, color: colors.slate700 },
  chipTextActive: { color: colors.onPrimary },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '30%', paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: colors.slate300,
  },
  timeChipActive: { backgroundColor: colors.sapphire, borderColor: colors.sapphire },
  timeChipText: { ...fonts.labelMd, color: colors.slate700 },
  timeChipTextActive: { color: colors.onPrimary },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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
