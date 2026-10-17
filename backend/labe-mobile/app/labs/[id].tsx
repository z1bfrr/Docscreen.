import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, FlaskConical, Clock, Droplet, SortAsc, 
  MapPin, Star, Verified, Activity 
} from 'lucide-react-native';
import { colors, fonts, spacing, rounded } from '../../src/theme';

// Mock Data
const MOCK_TESTS = {
  '1': { id: '1', name: 'Complete Blood Count (CBC)', shortName: 'CBC', preparation: 'Fasting for 10-12 hours required', turnaroundTime: '12 hrs', sampleType: 'Blood' },
  '2': { id: '2', name: 'HbA1c', shortName: 'HbA1c', preparation: 'No special preparation needed', turnaroundTime: '12 hrs', sampleType: 'Blood' },
  '3': { id: '3', name: 'Urine Routine & Microscopic', shortName: 'Urine Routine', preparation: 'Early morning sample preferred', turnaroundTime: '8 hrs', sampleType: 'Urine' },
  '4': { id: '4', name: 'Chest X-Ray', shortName: 'Chest X-Ray', preparation: 'Remove metal objects before test', turnaroundTime: '2 hrs', sampleType: 'Imaging' },
};

const MOCK_LABS = [
  { id: 'l1', name: 'AuraLab Central', distance: '1.2 km', address: 'KK Nagar, Madurai', rating: 4.8, reviewCount: 12500, isNablCertified: true, isCapCertified: true, operatingHours: '07:00 AM - 08:00 PM', homeCollectionCharge: 0, price: 350, originalPrice: 600 },
  { id: 'l2', name: 'Apollo Diagnostics', distance: '3.5 km', address: 'Anna Nagar, Madurai', rating: 4.6, reviewCount: 8400, isNablCertified: true, isCapCertified: false, operatingHours: '06:30 AM - 09:00 PM', homeCollectionCharge: 50, price: 400, originalPrice: 650 },
  { id: 'l3', name: 'Thyrocare', distance: '5.1 km', address: 'Simmakkal, Madurai', rating: 4.5, reviewCount: 22000, isNablCertified: true, isCapCertified: true, operatingHours: '06:00 AM - 07:00 PM', homeCollectionCharge: 0, price: 450, originalPrice: 700 },
];

export default function CompareLabsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const test = MOCK_TESTS[id as keyof typeof MOCK_TESTS] || MOCK_TESTS['1'];
  const labs = MOCK_LABS.sort((a, b) => a.price - b.price);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft color={colors.deepSlate} size={24} />
        </TouchableOpacity>
        <View style={styles.appBarTitleWrap}>
          <Text style={styles.appBarTitle}>{test.shortName}</Text>
          <Text style={styles.appBarSubtitle}>{labs.length} labs available in Madurai</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Test Info Card */}
        <View style={styles.testInfoCard}>
          <View style={styles.testInfoRow}>
            <View style={styles.testIconWrap}>
              <Activity color={colors.sapphire} size={26} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.testName}>{test.name}</Text>
              
              <View style={styles.testChipRow}>
                <View style={styles.testChip}>
                  <Clock color={colors.sapphire} size={14} />
                  <Text style={styles.testChipText}>{test.turnaroundTime}</Text>
                </View>
                <View style={styles.testChip}>
                  <Droplet color={colors.sapphire} size={14} />
                  <Text style={styles.testChipText}>{test.sampleType}</Text>
                </View>
              </View>

              <Text style={styles.prepText}>Preparation: {test.preparation}</Text>
            </View>
          </View>
        </View>

        {/* Sorted Label */}
        <View style={styles.sortedLabelRow}>
          <SortAsc color={colors.slate500} size={16} />
          <Text style={styles.sortedLabelText}>Sorted by lowest price</Text>
        </View>

        {/* Lab Cards */}
        <View style={styles.labsList}>
          {labs.map(lab => (
            <View key={lab.id} style={styles.labCard}>
              
              {/* Header Row */}
              <View style={styles.labHeaderRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.labName}>{lab.name}</Text>
                  <View style={styles.labLocationRow}>
                    <MapPin color={colors.slate500} size={14} />
                    <Text style={styles.labLocationText}>{lab.distance}</Text>
                    <Text style={styles.labLocationDot}>•</Text>
                    <Text style={styles.labLocationText} numberOfLines={1}>{lab.address}</Text>
                  </View>
                </View>
                
                <View style={styles.ratingBadge}>
                  <Star color="#F59E0B" size={14} fill="#F59E0B" />
                  <Text style={styles.ratingText}>{lab.rating.toFixed(1)}</Text>
                </View>
              </View>

              {/* Badges Row */}
              <View style={styles.badgesWrap}>
                {lab.isNablCertified && (
                  <View style={[styles.certBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Verified color={colors.emerald} size={12} />
                    <Text style={[styles.certText, { color: colors.emerald }]}>NABL</Text>
                  </View>
                )}
                {lab.isCapCertified && (
                  <View style={[styles.certBadge, { backgroundColor: 'rgba(29, 78, 216, 0.12)' }]}>
                    <Verified color={colors.sapphire} size={12} />
                    <Text style={[styles.certText, { color: colors.sapphire }]}>CAP</Text>
                  </View>
                )}
                
                <View style={styles.timeBadge}>
                  <Clock color={colors.slate700} size={12} />
                  <Text style={styles.timeText}>{lab.operatingHours}</Text>
                </View>

                {lab.homeCollectionCharge === 0 ? (
                  <View style={styles.freeHomeBadge}>
                    <Text style={styles.freeHomeText}>Free Home Collection</Text>
                  </View>
                ) : (
                  <View style={styles.paidHomeBadge}>
                    <Text style={styles.paidHomeText}>Home: ₹{lab.homeCollectionCharge}</Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              {/* Price & Book Button */}
              <View style={styles.labFooter}>
                <View>
                  <Text style={styles.finalPrice}>₹{lab.price}</Text>
                  <View style={styles.savingsRow}>
                    <Text style={styles.originalPrice}>₹{lab.originalPrice}</Text>
                    <Text style={styles.savingsText}>Save ₹{lab.originalPrice - lab.price}</Text>
                  </View>
                  <Text style={styles.reviewCountText}>{(lab.reviewCount / 1000).toFixed(1)}k reviews</Text>
                </View>
                
                <TouchableOpacity style={styles.bookBtn} onPress={() => router.push(`/booking?testId=${test.id}&labId=${lab.id}`)}>
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate300,
  },
  backBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
  appBarTitleWrap: { flex: 1 },
  appBarTitle: { ...fonts.headlineMd, color: colors.deepSlate },
  appBarSubtitle: { ...fonts.bodySm, color: colors.slate500 },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  testInfoCard: {
    backgroundColor: colors.sapphireLight,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  testInfoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  testIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(29, 78, 216, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  testName: { ...fonts.headlineSm, color: colors.deepSlate, marginBottom: 8 },
  testChipRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  testChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  testChipText: { ...fonts.labelSm, color: colors.sapphire },
  prepText: { ...fonts.bodySm, color: colors.slate700 },

  sortedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sortedLabelText: { ...fonts.bodySm, color: colors.slate500 },

  labsList: { gap: 12 },
  labCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  labHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  labName: { ...fonts.labelLg, color: colors.deepSlate, fontWeight: '700', marginBottom: 4 },
  labLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  labLocationText: { ...fonts.bodySm, color: colors.slate500, flexShrink: 1 },
  labLocationDot: { ...fonts.bodySm, color: colors.slate500 },
  
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: { ...fonts.labelSm, color: colors.emeraldDark, fontWeight: '700' },

  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  certText: { ...fonts.labelSm, fontWeight: '700' },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  timeText: { ...fonts.labelSm, color: colors.slate700 },
  freeHomeBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  freeHomeText: { ...fonts.labelSm, color: '#0E7490' },
  paidHomeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  paidHomeText: { ...fonts.labelSm, color: '#92400E' },

  divider: {
    height: 1,
    backgroundColor: 'rgba(203, 213, 225, 0.3)',
    marginBottom: 16,
  },

  labFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalPrice: { ...fonts.headlineMd, color: colors.sapphire, fontWeight: '800' },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 },
  originalPrice: { ...fonts.bodySm, color: colors.slate500, textDecorationLine: 'line-through' },
  savingsText: { ...fonts.labelSm, color: colors.emeraldDark },
  reviewCountText: { ...fonts.bodySm, color: colors.slate500 },

  bookBtn: {
    backgroundColor: colors.sapphire,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: { ...fonts.labelLg, color: colors.onPrimary },
});
