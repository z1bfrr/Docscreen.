import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Animated, Easing, Dimensions, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native'; 
import { API } from '../../src/api/client';
import { HealthPackage } from '../../src/types';
import { useCartStore } from '../../src/store/cartStore';
import { colors, spacing, rounded, fonts } from '../../src/theme';

// Import our beautiful custom SVG icons
import { 
  SearchIcon, 
  NearbyIcon, 
  HomeCollectionIcon, 
  TestsIcon, 
  FavoritesIcon, 
  LabsIcon, 
  ReportsIcon, 
  BookingsIcon,
  CheckIcon,
  AddIcon
} from '../../src/components/CustomIcons';

const { width } = Dimensions.get('window');

const RISK_CATEGORIES = [
  { id: '1', name: 'Heart Health', icon: <FavoritesIcon color="#E11D48" size={28} /> },
  { id: '2', name: 'Diabetes', icon: <LabsIcon color="#059669" size={28} /> },
  { id: '3', name: 'Kidney', icon: <ReportsIcon color="#D97706" size={28} /> },
  { id: '4', name: 'General', icon: <TestsIcon color="#0284C7" size={28} /> },
];

const POPULAR_TESTS = [
  { id: '1', name: 'Complete Blood Count (CBC)', sampleType: 'Blood', turnaroundTime: '12 hrs', parameters: 24, price: 350, iconColor: '#E11D48' },
  { id: '2', name: 'HbA1c', sampleType: 'Blood', turnaroundTime: '12 hrs', parameters: 1, price: 400, iconColor: '#059669' },
  { id: '3', name: 'Lipid Profile', sampleType: 'Blood', turnaroundTime: '24 hrs', parameters: 8, price: 600, iconColor: '#D97706' },
];

const PROMO_DATA = [
  { id: '1', tag: 'LIMITED TIME', title: 'Get 20% off your\nfirst full body check', code: 'LABE20', colors: ['#FDF2F8', '#FCE7F3'] as const, iconColor: '#BE185D' },
  { id: '2', tag: 'HEART CARE', title: 'Free Cardiac\nConsultation', code: 'HEARTCARE', colors: ['#F0FDF4', '#DCFCE7'] as const, iconColor: '#15803D' },
];

const MOCK_PACKAGES: any[] = [
  { id: 'p1', name: 'Comprehensive Full Body Checkup', testCount: 65, originalPrice: 3000, discountedPrice: 999, isBestseller: true, color1: '#E0F2FE', color2: '#BAE6FD' },
  { id: 'p2', name: 'Advanced Heart Care Package', testCount: 22, originalPrice: 2000, discountedPrice: 799, isBestseller: false, color1: '#FCE7F3', color2: '#FBCFE8' },
  { id: 'p3', name: 'Basic Diabetic Profile', testCount: 15, originalPrice: 1200, discountedPrice: 499, isBestseller: false, color1: '#D1FAE5', color2: '#A7F3D0' },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AnimatedCard = ({ children, onPress, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 20 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <AnimatedTouchable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={0.9} style={[style, { transform: [{ scale }] }]}>
      {children}
    </AnimatedTouchable>
  );
};

const Skeleton = ({ width, height, style, borderRadius = 8 }: any) => {
  const animValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(animValue, { toValue: 0, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);
  const opacity = animValue.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  return <Animated.View style={[{ width, height, backgroundColor: '#CBD5E1', borderRadius, opacity }, style]} />;
};

export default function HomeScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  // Dynamic greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 18) return 'Good Afternoon 🌤️';
    return 'Good Evening 🌙';
  };

  // Animations
  const contentAnim = useRef(new Animated.Value(50)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(contentFade, { toValue: 1, duration: 800, useNativeDriver: true })
    ]).start();

    // Simulate API fetch for data
    const timer = setTimeout(() => {
      setPackages(MOCK_PACKAGES);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const renderPromoItem = ({ item }: any) => (
    <View style={{ width: width - 40, marginRight: 16 }}>
      <LinearGradient colors={item.colors} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.promoBanner}>
        <View style={{flex: 1}}>
          <Text style={[styles.promoTag, { color: item.iconColor }]}>{item.tag}</Text>
          <Text style={[styles.promoTitle, { color: '#0F172A' }]}>{item.title}</Text>
          <Text style={[styles.promoCode, { color: '#475569' }]}>Use code <Text style={{fontWeight: '900', color: item.iconColor }}>{item.code}</Text></Text>
        </View>
        <View style={styles.promoIconWrap}>
          <FavoritesIcon color={item.iconColor} size={40} />
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        
        {/* VIBRANT HERO SECTION */}
        <Animated.View style={{ transform: [{ translateY: headerTranslateY }] }}>
          <LinearGradient
            colors={['#1e3a8a', '#2952e3', '#3b82f6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <SafeAreaView edges={['top']} />
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.welcomeSubtitle}>{getGreeting()}</Text>
                <Text style={styles.welcomeTitle}>Mukesh</Text>
              </View>
              <View style={styles.locationBadge}>
                <NearbyIcon color={colors.onPrimary} size={16} />
                <Text style={styles.locationText}>Madurai</Text>
              </View>
            </View>

            {/* GLASSMORPHIC SEARCH BAR */}
            <TouchableOpacity style={styles.searchGlass} activeOpacity={0.9} onPress={() => router.push('/search')}>
              <SearchIcon color="#2952e3" size={22} />
              <View style={{ flex: 1, pointerEvents: 'none' }}>
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Search tests, packages, labs..."
                  placeholderTextColor="#64748B"
                  editable={false}
                />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentAnim }] }}>
          
          {/* QUICK ACTIONS ROW */}
          <View style={styles.quickActionsContainer}>
            <AnimatedCard style={styles.quickActionCard} onPress={() => router.push('/search')}>
              <View style={[styles.qaIconWrap, { backgroundColor: '#E0E7FF' }]}>
                <HomeCollectionIcon color="#4338CA" size={28} />
              </View>
              <Text style={styles.qaTitle}>Home{'\n'}Collection</Text>
            </AnimatedCard>

            <AnimatedCard style={styles.quickActionCard} onPress={() => router.push('/search')}>
              <View style={[styles.qaIconWrap, { backgroundColor: '#ECFDF5' }]}>
                <NearbyIcon color="#047857" size={28} />
              </View>
              <Text style={styles.qaTitle}>Labs{'\n'}Near Me</Text>
            </AnimatedCard>

            <AnimatedCard style={styles.quickActionCard}>
              <View style={[styles.qaIconWrap, { backgroundColor: '#FFF7ED' }]}>
                <AddIcon color="#C2410C" size={28} />
              </View>
              <Text style={styles.qaTitle}>Upload{'\n'}Prescription</Text>
            </AnimatedCard>
          </View>

          {/* PROMOTIONAL BANNER CAROUSEL */}
          <View style={styles.promoContainer}>
            <FlatList
              data={PROMO_DATA}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id}
              renderItem={renderPromoItem}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
              snapToAlignment="start"
              decelerationRate="fast"
              snapToInterval={width - 24} // 40 (card margin/padding offset) + 16 (gap)
            />
          </View>

          {/* CATEGORIES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Browse by Organ</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {RISK_CATEGORIES.map(cat => (
                <AnimatedCard key={cat.id} style={styles.riskCard}>
                  <View style={styles.riskIconWrap}>{cat.icon}</View>
                  <Text style={styles.riskName}>{cat.name}</Text>
                </AnimatedCard>
              ))}
            </ScrollView>
          </View>

          {/* HEALTH PACKAGES */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Popular Packages</Text>
                <Text style={styles.sectionSubtitle}>Exclusive discounts for you</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/search')}><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {isLoading ? (
                <>
                  <Skeleton width={270} height={200} borderRadius={24} style={{ marginRight: 16 }} />
                  <Skeleton width={270} height={200} borderRadius={24} style={{ marginRight: 16 }} />
                </>
              ) : (
                packages.map((pkg) => (
                  <AnimatedCard 
                    key={pkg.id} 
                    style={[styles.pkgCard]}
                    onPress={() => {
                      addToCart('PACKAGE', pkg, pkg.discountedPrice);
                      Alert.alert("Added to Cart!", `${pkg.name} has been added to your cart.`);
                    }}
                  >
                    <LinearGradient colors={[pkg.color1, pkg.color2]} style={styles.pkgTopBg} />
                    
                    {pkg.isBestseller && (
                      <View style={styles.bestSellerBadge}>
                        <Text style={styles.bestSellerText}>⭐ Bestseller</Text>
                      </View>
                    )}
                    <Text style={styles.pkgName} numberOfLines={2}>{pkg.name}</Text>
                    
                    <View style={styles.pkgDetailRow}>
                      <TestsIcon color="#0284C7" size={16} />
                      <Text style={styles.pkgTestCount}>{pkg.testCount} parameters included</Text>
                    </View>
                    
                    <View style={styles.pkgPriceRow}>
                      <View>
                        <Text style={styles.pkgPriceActive}>₹{pkg.discountedPrice}</Text>
                        <Text style={styles.pkgPriceStrike}>₹{pkg.originalPrice}</Text>
                      </View>
                      <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookBtnText}>Book Now</Text>
                      </TouchableOpacity>
                    </View>
                  </AnimatedCard>
                ))
              )}
            </ScrollView>
          </View>

          {/* POPULAR TESTS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Most Booked Tests</Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: spacing.gutterSm, gap: 12 }}>
              {isLoading ? (
                <>
                  <Skeleton width="100%" height={90} borderRadius={20} />
                  <Skeleton width="100%" height={90} borderRadius={20} />
                  <Skeleton width="100%" height={90} borderRadius={20} />
                </>
              ) : (
                POPULAR_TESTS.map(test => (
                  <AnimatedCard key={test.id} style={styles.popularTestRow}>
                    <View style={[styles.popularTestIconWrap, { backgroundColor: test.iconColor + '15' }]}>
                      <TestsIcon color={test.iconColor} size={24} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.popularTestName}>{test.name}</Text>
                      <Text style={styles.popularTestSub}>{test.sampleType} • {test.turnaroundTime}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.popularTestPrice}>₹{test.price}</Text>
                      <ChevronRight color={colors.slate300} size={18} />
                    </View>
                  </AnimatedCard>
                ))
              )}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, 
  scrollContent: { paddingBottom: 80 },

  heroSection: {
    paddingHorizontal: 20,
    paddingBottom: 45,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 28,
  },
  welcomeSubtitle: { ...fonts.bodyMd, color: '#93C5FD', fontWeight: '500' },
  welcomeTitle: { ...fonts.headlineMd, color: '#FFFFFF', fontSize: 26 },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  locationText: { ...fonts.labelMd, color: '#FFFFFF', fontWeight: '700' },

  searchGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    ...fonts.bodyMd,
    color: '#0F172A',
    fontSize: 16,
  },

  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -25,
    marginBottom: 10,
    zIndex: 10,
  },
  quickActionCard: {
    backgroundColor: '#FFFFFF',
    width: (width - 60) / 3,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 10,
  },
  qaIconWrap: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: 'center', alignItems: 'center',
  },
  qaTitle: { ...fonts.labelSm, color: '#1E293B', textAlign: 'center', fontWeight: '700', lineHeight: 16 },

  promoContainer: { marginTop: 24, marginBottom: 12 },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  promoTag: { ...fonts.labelSm, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  promoTitle: { ...fonts.headlineSm, fontSize: 18, lineHeight: 24, marginBottom: 12 },
  promoCode: { ...fonts.bodySm, fontSize: 13 },
  promoIconWrap: { width: 70, height: 70, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 35, justifyContent: 'center', alignItems: 'center' },

  section: { marginTop: 32 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, marginBottom: 16
  },
  sectionTitle: { ...fonts.headlineSm, color: '#0F172A', fontSize: 20 },
  sectionSubtitle: { ...fonts.bodySm, color: '#64748B', marginTop: 4 },
  seeAllText: { ...fonts.labelMd, color: '#2563EB', fontWeight: '700', marginBottom: 2 },
  hScroll: { paddingHorizontal: 20, gap: 16 },

  riskCard: {
    width: 90,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    borderWidth: 1, borderColor: '#F1F5F9',
    gap: 12
  },
  riskIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center'
  },
  riskName: { ...fonts.labelSm, color: '#334155', textAlign: 'center', fontWeight: '600' },

  pkgCard: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  pkgTopBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, opacity: 0.4 },
  bestSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1, borderColor: '#FDE68A'
  },
  bestSellerText: { ...fonts.labelSm, color: '#92400E', fontWeight: '700' },
  pkgName: { ...fonts.headlineSm, fontSize: 18, color: '#0F172A', marginBottom: 12, lineHeight: 24 },
  pkgDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  pkgTestCount: { ...fonts.bodySm, color: '#0284C7', fontWeight: '600' },
  pkgPriceRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  pkgPriceActive: { ...fonts.headlineSm, color: '#1E40AF', fontSize: 22 },
  pkgPriceStrike: { ...fonts.bodySm, color: '#94A3B8', textDecorationLine: 'line-through', marginBottom: 2 },
  bookBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  bookBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  popularTestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    gap: 16,
  },
  popularTestIconWrap: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  popularTestName: { ...fonts.headlineSm, color: '#0F172A', fontSize: 16, marginBottom: 4 },
  popularTestSub: { ...fonts.bodySm, color: '#64748B' },
  popularTestPrice: { ...fonts.headlineSm, color: '#2563EB', fontSize: 17, marginBottom: 2 },
});
