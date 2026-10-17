import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, User, Sliders, Sparkles, CreditCard, Bolt, Navigation, Star, Home, Verified, FlaskConical, Calendar, Globe } from 'lucide-react-native';
import { API } from '../../src/api/client';
import { DiagnosticTest, TestCategory } from '../../src/types';
import { useCartStore } from '../../src/store/cartStore';
import { colors, spacing, rounded, fonts } from '../../src/theme';

export default function LabsScreen() {
  const [tests, setTests] = React.useState<DiagnosticTest[]>([]);
  const [categories, setCategories] = React.useState<TestCategory[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const addToCart = useCartStore((state) => state.addToCart);

  React.useEffect(() => {
    API.tests.getAll().then(res => setTests(res.data)).catch(console.error);
    API.tests.getCategories().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const filteredTests = tests.filter(test => {
    const matchesTab = activeTabId === null || test.categoryId === activeTabId;
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          test.shortName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* HEADER: Ultra-luxury Glassmorphic Style */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft color={colors.onSurfaceVariant} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Test Details</Text>
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
        
        {/* Dynamic Ambient Glow Backing Header */}
        <View style={styles.ambientHeader}>
          <View style={styles.ambientRow}>
            <View style={{flex: 1}}>
              <View style={styles.apiBadge}>
                <Text style={styles.apiBadgeText}>AURA PRECISION INDEX</Text>
              </View>
              <Text style={styles.ambientTitle}>Compare Labs for Tests</Text>
              <Text style={styles.ambientSubtitle}>Choose based on verified ratings, price, speed, and distance.</Text>
            </View>
            <TouchableOpacity style={styles.tuneBtn}>
              <Text style={{color: colors.onSurfaceVariant}}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Box / Current Selection Box */}
          <View style={styles.searchGlass}>
            <TextInput 
              style={styles.searchInput}
              placeholder="Search tests (e.g. CBC, Lipid)..."
              placeholderTextColor={colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories (Pills) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          <TouchableOpacity 
            style={[styles.pill, activeTabId === null && styles.pillActive]}
            onPress={() => setActiveTabId(null)}
          >
            <Text style={[styles.pillText, activeTabId === null && styles.pillTextActive]}>All Tests</Text>
          </TouchableOpacity>
          {categories.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              style={[styles.pill, activeTabId === cat.id && styles.pillActive]}
              onPress={() => setActiveTabId(cat.id)}
            >
              <Text style={[styles.pillText, activeTabId === cat.id && styles.pillTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listContainer}>
          {filteredTests.map((test) => (
            /* Card 1: Laboratory Comparison Stack */
            <View key={test.id} style={styles.card}>
              
              {/* Card Header Top Row */}
              <View style={styles.cardTopRow}>
                <View style={styles.bestMatchBadge}>
                  <Text style={styles.bestMatchText}>Best Clinical Match</Text>
                </View>
                <View style={styles.slotsBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.slotsText}>Slots Open Today</Text>
                </View>
              </View>

              {/* Lab Info Row */}
              <View style={styles.labInfoRow}>
                <View style={styles.labIconWrapper}>
                  {/* Fake a luxury image or icon */}
                  <View style={styles.labIconInner}>
                    <Text style={{fontSize: 24}}>🏥</Text>
                  </View>
                </View>
                <View style={styles.labInfoText}>
                  <Text style={styles.labName}>AuraLab Diagnostics</Text>
                  <View style={styles.labMetaRow}>
                    <Text style={styles.labRating}>★ 4.8</Text>
                    <Text style={styles.labCount}>(1,420)</Text>
                    <Text style={styles.labDistance}>• 1.2 km away</Text>
                  </View>
                </View>
              </View>

              {/* Test Summary Row */}
              <View style={styles.testSummaryBox}>
                <View style={styles.testNameRow}>
                  <Text style={styles.testNameText}>{test.name} ({test.shortName})</Text>
                </View>
                <Text style={styles.methodText}>Automated Flow Cytometry</Text>
              </View>

              {/* Turnaround / Earliest Sample */}
              <View style={styles.grid2}>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}>Turnaround</Text>
                  <Text style={styles.gridValue}>Report in ~4 hrs</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.gridLabel}>Earliest Sample</Text>
                  <Text style={styles.gridValue}>Today • 11:30 AM</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.cardTagsRow}>
                {test.isHomeCollectionAvailable === 1 && (
                  <View style={styles.tagGreen}><Text style={styles.tagGreenText}>Free Home Collection</Text></View>
                )}
                <View style={styles.tagGray}><Text style={styles.tagGrayText}>Lab Walk-in</Text></View>
              </View>

              {/* Footer pricing and CTA */}
              <View style={styles.cardFooter}>
                <View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceActive}>₹{test.price}</Text>
                    <Text style={styles.priceStrikethrough}>₹{test.price * 2}</Text>
                  </View>
                  <Text style={styles.saveText}>Save 50% OFF</Text>
                </View>
                <View style={styles.ctaRow}>
                  <TouchableOpacity style={styles.viewLabBtn}>
                    <Text style={styles.viewLabBtnText}>View Lab</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.bookSlotBtn}
                    onPress={() => {
                      addToCart('TEST', test, test.price);
                      Alert.alert("Added to Cart!", `${test.name} has been added to your cart.`);
                    }}
                  >
                    <Text style={styles.bookSlotText}>Book Slot</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          <View style={{height: 120}} />
        </View>

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
  
  scrollContent: { paddingTop: 16 },

  // Ambient Header
  ambientHeader: { paddingHorizontal: spacing.gutter, paddingBottom: spacing.spaceSm },
  ambientRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  apiBadge: { backgroundColor: 'rgba(0, 55, 176, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0, 55, 176, 0.2)' },
  apiBadgeText: { ...fonts.labelSm, color: colors.primary },
  ambientTitle: { ...fonts.headlineMd, color: colors.onSurface, marginBottom: 4 },
  ambientSubtitle: { ...fonts.bodyMd, color: colors.onSurfaceVariant },
  tuneBtn: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: 'rgba(230,232,234,0.7)', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  
  searchGlass: { marginTop: 16, padding: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)' },
  searchInput: { height: 48, paddingHorizontal: 16, ...fonts.bodyMd, color: colors.onSurface },
  
  // Pills
  pillsScroll: { paddingHorizontal: spacing.gutter, paddingVertical: 8, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: 'rgba(230,232,234,0.7)' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { ...fonts.labelMd, color: colors.onSurface },
  pillTextActive: { color: colors.onPrimary },
  
  // List
  listContainer: { paddingHorizontal: spacing.gutter, marginTop: spacing.spaceSm },
  card: { backgroundColor: colors.surfaceContainerLowest, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(230,232,234,0.7)', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 30, elevation: 3 },
  
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  bestMatchBadge: { backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  bestMatchText: { ...fonts.labelSm, color: colors.onPrimary },
  slotsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLow, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(230,232,234,0.5)' },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald, marginRight: 6 },
  slotsText: { ...fonts.labelSm, color: colors.onSurfaceVariant },
  
  labInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  labIconWrapper: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surfaceContainer, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  labIconInner: {},
  labInfoText: { flex: 1 },
  labName: { ...fonts.headlineSm, color: colors.onSurface, fontSize: 18 },
  labMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  labRating: { ...fonts.labelSm, color: '#f59e0b', fontSize: 13 },
  labCount: { ...fonts.bodySm, color: colors.onSurfaceVariant, marginLeft: 4 },
  labDistance: { ...fonts.bodySm, color: colors.onSurfaceVariant, marginLeft: 4 },
  
  testSummaryBox: { backgroundColor: colors.surfaceContainerLow, padding: 12, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(230,232,234,0.5)', marginBottom: 12 },
  testNameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  testNameText: { ...fonts.bodyMd, fontWeight: '600', color: colors.onSurface },
  methodText: { ...fonts.labelSm, color: colors.primary, backgroundColor: colors.surfaceContainerLowest, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  
  grid2: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  gridBox: { flex: 1, backgroundColor: colors.surfaceContainerLow, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(230,232,234,0.4)' },
  gridLabel: { ...fonts.labelSm, color: colors.onSurfaceVariant, marginBottom: 2, textTransform: 'none' },
  gridValue: { ...fonts.labelMd, color: colors.onSurface, fontSize: 14 },
  
  cardTagsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tagGreen: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  tagGreenText: { ...fonts.labelSm, color: '#047857', textTransform: 'none' },
  tagGray: { backgroundColor: colors.surfaceContainerLow, borderWidth: 1, borderColor: 'rgba(230,232,234,0.5)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16 },
  tagGrayText: { ...fonts.labelSm, color: colors.onSurface, textTransform: 'none' },
  
  cardFooter: { backgroundColor: 'rgba(242,244,246,0.9)', marginHorizontal: -20, marginBottom: -20, paddingHorizontal: 20, paddingVertical: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, borderTopWidth: 1, borderTopColor: 'rgba(230,232,234,0.6)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 },
  priceActive: { ...fonts.headlineMd, color: colors.primary, marginRight: 6 },
  priceStrikethrough: { ...fonts.bodySm, color: colors.outline, textDecorationLine: 'line-through' },
  saveText: { ...fonts.labelSm, color: colors.emerald, textTransform: 'none' },
  
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewLabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceContainerLowest, borderWidth: 1, borderColor: 'rgba(230,232,234,0.7)' },
  viewLabBtnText: { ...fonts.labelMd, color: colors.onSurface },
  bookSlotBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary },
  bookSlotText: { ...fonts.labelMd, color: colors.onPrimary },
});
