import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, User, MapPin, Bike, Syringe, Phone, MessageCircle, Snowflake, Headset, Check, Pipette, Thermometer, Microscope, FileText } from 'lucide-react-native';
import { colors, spacing, rounded, fonts } from '../../src/theme';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft color={colors.onSurfaceVariant} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Live Tracking</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Bell color={colors.onSurfaceVariant} size={20} />
          </TouchableOpacity>
          <View style={styles.avatarWrap}>
            <User color={colors.onPrimary} size={18} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Booking Identification Sub-bar */}
        <View style={styles.subBar}>
          <View style={styles.subBarLeft}>
            <View style={styles.badgeId}><Text style={styles.badgeIdText}>#AL-84920</Text></View>
            <Text style={styles.subBarDot}>•</Text>
            <Text style={styles.subBarTitle} numberOfLines={1}>CBC Complete Profile</Text>
          </View>
          <View style={styles.badgeLab}>
            <Text style={styles.badgeLabText}>ABC Diagnostics</Text>
          </View>
        </View>

        {/* Live Status Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroRow1}>
            <View style={styles.heroStatusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.heroStatusText}>PHLEBOTOMIST EN ROUTE</Text>
            </View>
            <View style={styles.liveGpsBadge}>
              <Text style={styles.liveGpsText}>Live GPS</Text>
            </View>
          </View>
          <View style={styles.heroRow2}>
            <Text style={styles.heroTime}>12</Text>
            <Text style={styles.heroTimeSub}>mins</Text>
            <View style={styles.onScheduleBadge}><Text style={styles.onScheduleText}>On Calendar</Text></View>
          </View>
          <View style={styles.heroRow3}>
            <MapPin color="#FFF" size={16} />
            <Text style={styles.heroLocation}>Arriving at Flat 4B, Anna Nagar West</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
        </View>

        {/* Interactive Map Canvas Placeholder */}
        <View style={styles.mapCard}>
          <View style={styles.mapInner}>
            <Text style={styles.mapPlaceholderText}>Live Map Tracking View</Text>
            <View style={styles.bikeIconBox}>
              <Text style={{fontSize: 20}}>🛵</Text>
            </View>
            <View style={styles.etaBadge}><Text style={styles.etaText}>Arun (0.8 km away)</Text></View>
          </View>
        </View>

        {/* Phlebotomist Glass Profile Card */}
        <View style={styles.phlebotomistCard}>
          <View style={styles.phlebHeader}>
            <View style={styles.phlebAvatar}>
              <Text style={{fontSize: 28}}>👨🏽‍⚕️</Text>
            </View>
            <View style={styles.phlebInfo}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.phlebName}>Arun Kumar</Text>
                <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>
              </View>
              <Text style={styles.phlebSub}>Senior Phlebotomist • Sterile Certified</Text>
              <Text style={styles.phlebRating}>★ 4.9 • 420+ safe collections</Text>
            </View>
          </View>
          
          <View style={styles.phlebCheckRow}>
            <View style={styles.checkItem}>
              <View style={styles.checkIconBox}><Text>🛡️</Text></View>
              <View>
                <Text style={styles.checkTitle}>Background Checked</Text>
                <Text style={styles.checkSub}>Aadhaar & Police Vetted</Text>
              </View>
            </View>
            <View style={styles.checkItem}>
              <View style={styles.checkIconBox}><Text>🧼</Text></View>
              <View>
                <Text style={styles.checkTitle}>Kit Sanitized</Text>
                <Text style={styles.checkSub}>Single-use BD Vacutainer</Text>
              </View>
            </View>
          </View>

          <View style={styles.phlebActions}>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Phone Arun</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>💬 Direct MessageCircle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Reassurance Pill */}
        <View style={styles.safetyCard}>
          <View style={styles.safetyIconBox}><Text>❄️</Text></View>
          <View style={{flex: 1}}>
            <Text style={styles.safetyTitle}>Temperature Controlled Transit</Text>
            <Text style={styles.safetySub}>All samples transported in WHO-standard cold-chain vacutainers at 2–8°C.</Text>
          </View>
        </View>

        {/* Clinical Sample Journey Timeline */}
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View>
              <Text style={styles.timelineTitle}>Sample Lifecycle</Text>
              <Text style={styles.timelineSub}>Clinical chain of custody verification</Text>
            </View>
            <View style={styles.liveTrackingPill}><Text style={styles.liveTrackingText}>Live Tracking</Text></View>
          </View>
          
          <View style={styles.timelineBody}>
            {/* Step 1 */}
            <View style={styles.timelineStep}>
              <View style={styles.stepIconBoxDone}><Check color="#FFF" size={14}/></View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitle}>Booking Confirmed & Lab Assigned</Text>
                  <Text style={styles.stepTime}>08:15 AM</Text>
                </View>
                <Text style={styles.stepDesc}>Diagnostic order routed to ABC Diagnostics Central Lab.</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineStep}>
              <View style={styles.stepLine} />
              <View style={styles.stepIconBoxDone}><Check color="#FFF" size={14}/></View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitle}>Kit Dispatched & Phlebotomist Assigned</Text>
                  <Text style={styles.stepTime}>08:30 AM</Text>
                </View>
                <Text style={styles.stepDesc}>Sterile BD Vacutainer & cold box assigned to Arun Kumar.</Text>
              </View>
            </View>

            {/* Step 3 Active */}
            <View style={styles.timelineStep}>
              <View style={styles.stepLineActive} />
              <View style={styles.stepIconBoxActive}><View style={styles.stepInnerDot}/></View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitleActive}>Phlebotomist En Route</Text>
                  <Text style={styles.stepTimeActive}>08:42 AM</Text>
                </View>
                <Text style={styles.stepDescActive}>Live tracking active. Phlebotomist navigating towards your location.</Text>
              </View>
            </View>

            {/* Step 4 Pending */}
            <View style={[styles.timelineStep, {opacity: 0.6}]}>
              <View style={styles.stepLinePending} />
              <View style={styles.stepIconBoxPending}></View>
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepTitlePending}>Sterile Sample Collection</Text>
                  <Text style={styles.stepTime}>Pending</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter, height: 64,
    backgroundColor: 'rgba(247, 249, 251, 0.8)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(230,232,234, 0.6)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { ...fonts.headlineSm, color: colors.onSurface, marginLeft: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, borderRadius: 20, marginRight: 8 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  
  scrollContent: { paddingTop: 16, paddingHorizontal: spacing.gutter },

  // Sub Bar
  subBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  subBarLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  badgeId: { backgroundColor: 'rgba(218,226,253, 0.7)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  badgeIdText: { ...fonts.labelSm, color: '#131b2e' },
  subBarDot: { marginHorizontal: 6, color: 'rgba(116,118,134,0.4)' },
  subBarTitle: { ...fonts.labelMd, color: colors.onSurface, flex: 1 },
  badgeLab: { backgroundColor: colors.surfaceContainerLowest, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(230,232,234,0.7)' },
  badgeLabText: { ...fonts.labelSm, color: colors.primary },

  // Hero Banner
  heroBanner: { backgroundColor: colors.primary, borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  heroRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroStatusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF', marginRight: 8 },
  heroStatusText: { ...fonts.labelSm, color: '#FFF' },
  liveGpsBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  liveGpsText: { ...fonts.labelSm, color: '#FFF', opacity: 0.9, textTransform: 'none' },
  
  heroRow2: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  heroTime: { ...fonts.displayLg, color: '#FFF' },
  heroTimeSub: { ...fonts.headlineSm, color: 'rgba(255,255,255,0.9)', marginLeft: 8 },
  onScheduleBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 'auto' },
  onScheduleText: { ...fonts.bodySm, color: '#FFF', fontWeight: '600' },
  
  heroRow3: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  heroLocation: { ...fonts.bodyMd, color: 'rgba(255,255,255,0.9)', marginLeft: 6 },
  progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { width: '60%', height: '100%', backgroundColor: '#FFF', borderRadius: 3 },

  // Map Placeholder
  mapCard: { height: 220, backgroundColor: colors.surfaceContainer, borderRadius: 24, marginBottom: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)', overflow: 'hidden' },
  mapInner: { alignItems: 'center', justifyContent: 'center' },
  mapPlaceholderText: { ...fonts.headlineSm, color: colors.onSurfaceVariant, opacity: 0.5 },
  bikeIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 12, borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  etaBadge: { backgroundColor: colors.onSurface, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 8 },
  etaText: { ...fonts.labelSm, color: '#FFF', textTransform: 'none' },

  // Phlebotomist Card
  phlebotomistCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20 },
  phlebHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  phlebAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fcd34d', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: 'rgba(0,55,176,0.2)' },
  phlebInfo: { flex: 1 },
  phlebName: { ...fonts.headlineSm, color: colors.onSurface, fontSize: 20, marginRight: 8 },
  verifiedBadge: { backgroundColor: 'rgba(218,226,253, 0.7)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  verifiedText: { ...fonts.labelSm, color: colors.primary, textTransform: 'none' },
  phlebSub: { ...fonts.bodySm, color: colors.onSurfaceVariant, marginTop: 4 },
  phlebRating: { ...fonts.bodySm, color: colors.onSurfaceVariant, marginTop: 2, fontWeight: '600' },
  
  phlebCheckRow: { flexDirection: 'row', gap: 10, backgroundColor: 'rgba(242,244,246,0.7)', padding: 12, borderRadius: 16, marginBottom: 16 },
  checkItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkIconBox: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkTitle: { ...fonts.labelSm, color: colors.onSurface, textTransform: 'none' },
  checkSub: { ...fonts.bodySm, color: colors.onSurfaceVariant, fontSize: 11 },
  
  phlebActions: { flexDirection: 'row', gap: 12 },
  callBtn: { flex: 1, height: 48, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  callBtnText: { ...fonts.labelMd, color: colors.onPrimary },
  chatBtn: { flex: 1, height: 48, borderRadius: 16, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)' },
  chatBtnText: { ...fonts.labelMd, color: colors.onSurface },

  // Safety Pill
  safetyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,101,119,0.95)', padding: 16, borderRadius: 20, marginBottom: 24 },
  safetyIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  safetyTitle: { ...fonts.labelMd, color: '#75e3ff' },
  safetySub: { ...fonts.bodySm, color: 'rgba(255,255,255,0.9)', marginTop: 2 },

  // Timeline Card
  timelineCard: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)' },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: 'rgba(230,232,234,0.4)', paddingBottom: 16, marginBottom: 20 },
  timelineTitle: { ...fonts.headlineSm, fontSize: 20, color: colors.onSurface },
  timelineSub: { ...fonts.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  liveTrackingPill: { backgroundColor: 'rgba(218,226,253, 0.7)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  liveTrackingText: { ...fonts.labelSm, color: '#131b2e' },
  
  timelineBody: { paddingLeft: 8 },
  timelineStep: { flexDirection: 'row', marginBottom: 24 },
  stepIconBoxDone: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: colors.surfaceContainerLowest, zIndex: 2 },
  stepIconBoxActive: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(0,55,176,0.2)', zIndex: 2 },
  stepInnerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  stepIconBoxPending: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceContainerHigh, borderWidth: 4, borderColor: colors.surfaceContainerLowest, zIndex: 2 },
  stepContent: { flex: 1, marginLeft: 16, paddingTop: 4 },
  stepTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  stepTitle: { ...fonts.labelMd, color: colors.onSurface, fontSize: 14, flex: 1 },
  stepTime: { ...fonts.bodySm, color: colors.onSurfaceVariant },
  stepDesc: { ...fonts.bodySm, color: colors.onSurfaceVariant },
  
  stepTitleActive: { ...fonts.labelMd, color: colors.primary, fontSize: 14, flex: 1 },
  stepTimeActive: { ...fonts.labelSm, color: colors.primary },
  stepDescActive: { ...fonts.bodySm, color: colors.onSurface, fontWeight: '500' },
  
  stepTitlePending: { ...fonts.labelMd, color: colors.onSurface, fontSize: 14, fontWeight: '500' },
  
  stepLine: { position: 'absolute', left: 15, top: -24, bottom: 20, width: 2, backgroundColor: colors.surfaceContainerHighest, zIndex: 1 },
  stepLineActive: { position: 'absolute', left: 15, top: -24, bottom: 20, width: 2, backgroundColor: colors.primary, zIndex: 1 },
  stepLinePending: { position: 'absolute', left: 15, top: -24, bottom: 20, width: 2, backgroundColor: colors.surfaceContainerHighest, zIndex: 1 },
});
