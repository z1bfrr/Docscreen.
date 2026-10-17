import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, fonts } from '../../src/theme';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { ActivityIcon, FavoritesIcon, ReportsIcon, CheckIcon } from '../../src/components/CustomIcons';

const { width } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ radius, stroke, progress, color }: any) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
      <G rotation="-90" origin={`${radius}, ${radius}`}>
        <Circle
          stroke="#E2E8F0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <AnimatedCircle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </G>
      <SvgText
        x={radius}
        y={radius + 10}
        textAnchor="middle"
        fontSize="32"
        fontWeight="800"
        fill="#0F172A"
      >
        {progress}
      </SvgText>
      <SvgText
        x={radius}
        y={radius + 30}
        textAnchor="middle"
        fontSize="12"
        fontWeight="600"
        fill="#64748B"
      >
        / 100
      </SvgText>
    </Svg>
  );
};

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={{ flex: 0, backgroundColor: '#F8FAFC' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Health Analytics</Text>
            <Text style={styles.headerSubtitle}>Track your vital metrics</Text>
          </View>
          <View style={styles.iconWrap}>
            <ActivityIcon color="#2563EB" size={24} />
          </View>
        </View>

        {/* OVERALL HEALTH SCORE */}
        <View style={styles.scoreContainer}>
          <Text style={styles.sectionTitle}>Overall Health Score</Text>
          <View style={styles.scoreCard}>
            <ProgressRing radius={90} stroke={14} progress={86} color="#10B981" />
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreStatus}>Excellent</Text>
              <Text style={styles.scoreDesc}>Your health score is in the top 15% of your age group. Keep it up!</Text>
            </View>
          </View>
        </View>

        {/* VITAL CARDS */}
        <View style={styles.vitalsContainer}>
          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <FavoritesIcon color="#DC2626" size={20} />
            </View>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>72 <Text style={styles.vitalUnit}>bpm</Text></Text>
            <Text style={styles.vitalTrendPos}>↓ 2 bpm</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: '#E0E7FF' }]}>
              <ReportsIcon color="#4338CA" size={20} />
            </View>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={styles.vitalValue}>120/80</Text>
            <Text style={styles.vitalTrendNeutral}>Normal</Text>
          </View>

          <View style={styles.vitalCard}>
            <View style={[styles.vitalIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <ActivityIcon color="#D97706" size={20} />
            </View>
            <Text style={styles.vitalLabel}>Glucose</Text>
            <Text style={styles.vitalValue}>95 <Text style={styles.vitalUnit}>mg/dL</Text></Text>
            <Text style={styles.vitalTrendPos}>Optimal</Text>
          </View>
        </View>

        {/* RECENT REPORTS */}
        <View style={styles.reportsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Lab Reports</Text>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.reportRow}>
            <View style={styles.reportIconWrap}>
              <ReportsIcon color="#2563EB" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportTitle}>Comprehensive Full Body Checkup</Text>
              <Text style={styles.reportDate}>12 Sep 2026 • Apollo Diagnostics</Text>
            </View>
            <View style={styles.statusBadge}>
              <CheckIcon color="#059669" size={14} />
              <Text style={styles.statusText}>Normal</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportRow}>
            <View style={styles.reportIconWrap}>
              <ReportsIcon color="#2563EB" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportTitle}>Lipid Profile</Text>
              <Text style={styles.reportDate}>05 Aug 2026 • SRL Labs</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
              <ActivityIcon color="#DC2626" size={14} />
              <Text style={[styles.statusText, { color: '#B91C1C' }]}>Action Req.</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  headerTitle: { ...fonts.headlineLg, color: '#0F172A', fontSize: 28 },
  headerSubtitle: { ...fonts.bodyMd, color: '#64748B', marginTop: 4 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  
  sectionTitle: { ...fonts.headlineSm, color: '#0F172A', fontSize: 20, marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAllText: { ...fonts.labelMd, color: '#2563EB', fontWeight: '700' },

  scoreContainer: { paddingHorizontal: 20, marginTop: 24 },
  scoreCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  scoreInfo: { alignItems: 'center', marginTop: 16 },
  scoreStatus: { ...fonts.headlineSm, color: '#10B981', fontSize: 22, marginBottom: 6 },
  scoreDesc: { ...fonts.bodySm, color: '#64748B', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10 },

  vitalsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 24, gap: 12 },
  vitalCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  vitalIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  vitalLabel: { ...fonts.labelSm, color: '#64748B', marginBottom: 6 },
  vitalValue: { ...fonts.headlineSm, color: '#0F172A', fontSize: 20, marginBottom: 6 },
  vitalUnit: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  vitalTrendPos: { ...fonts.labelSm, color: '#10B981', fontSize: 12, fontWeight: '700' },
  vitalTrendNeutral: { ...fonts.labelSm, color: '#64748B', fontSize: 12, fontWeight: '600' },

  reportsContainer: { paddingHorizontal: 20, marginTop: 32 },
  reportRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: 16, borderRadius: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9', gap: 16
  },
  reportIconWrap: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  reportTitle: { ...fonts.labelMd, color: '#0F172A', fontWeight: '700', marginBottom: 4 },
  reportDate: { ...fonts.bodySm, color: '#64748B', fontSize: 12 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 4,
    borderWidth: 1, borderColor: '#D1FAE5'
  },
  statusText: { ...fonts.labelSm, color: '#047857', fontWeight: '700', fontSize: 11 },
});
