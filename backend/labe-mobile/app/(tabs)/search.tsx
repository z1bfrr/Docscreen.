import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, X, Check, Clock, Droplet, Home, FlaskConical, SearchX } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, spacing, rounded } from '../../src/theme';

// Mocked Data similar to Android's MockRepository
const MOCK_CATEGORIES = [
  { id: 'blood', name: 'Blood Tests', color: '#1D4ED8' },
  { id: 'urine', name: 'Urine Tests', color: '#10B981' },
  { id: 'imaging', name: 'Imaging', color: '#F59E0B' },
];

const MOCK_TESTS = [
  { id: '1', name: 'Complete Blood Count (CBC)', description: 'Evaluates overall health and detects a wide range of disorders.', categoryId: 'blood', turnaroundTime: '12 hrs', sampleType: 'Blood', isHomeCollectionAvailable: true, minPrice: 350, labCount: 4 },
  { id: '2', name: 'HbA1c', description: 'Measures your average blood sugar levels over the past 3 months.', categoryId: 'blood', turnaroundTime: '12 hrs', sampleType: 'Blood', isHomeCollectionAvailable: true, minPrice: 400, labCount: 3 },
  { id: '3', name: 'Urine Routine & Microscopic', description: 'Checks for signs of disease, such as diabetes or kidney disease.', categoryId: 'urine', turnaroundTime: '8 hrs', sampleType: 'Urine', isHomeCollectionAvailable: true, minPrice: 200, labCount: 5 },
  { id: '4', name: 'Chest X-Ray', description: 'Produces images of the heart, lungs, blood vessels, airways.', categoryId: 'imaging', turnaroundTime: '2 hrs', sampleType: 'Imaging', isHomeCollectionAvailable: false, minPrice: 800, labCount: 2 },
];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsLoading(false);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const filteredTests = MOCK_TESTS.filter(test => {
    const matchesCategory = selectedCategory === 'all' || test.categoryId === selectedCategory;
    const matchesQuery = test.name.toLowerCase().includes(debouncedQuery.toLowerCase()) || 
                         test.description.toLowerCase().includes(debouncedQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      {/* Top Search Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrap}>
          <Search color={colors.sapphire} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search CBC, X-Ray, Thyroid..."
            placeholderTextColor={colors.slate500}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X color={colors.slate500} size={16} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity 
            style={[styles.chip, selectedCategory === 'all' && styles.chipSelected]}
            onPress={() => setSelectedCategory('all')}
          >
            {selectedCategory === 'all' && <Check color={colors.onPrimary} size={14} style={{ marginRight: 4 }} />}
            <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextSelected]}>All</Text>
          </TouchableOpacity>
          
          {MOCK_CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              style={[styles.chip, selectedCategory === cat.id && styles.chipSelected]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsCountWrap}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.sapphire} />
        ) : (
          <Text style={styles.resultsCountText}>
            {filteredTests.length} tests found
            {debouncedQuery.length > 0 && <Text style={{ color: colors.sapphire }}> for "{debouncedQuery}"</Text>}
          </Text>
        )}
      </View>

      {/* Results List */}
      {!isLoading && filteredTests.length === 0 ? (
        <View style={styles.emptyState}>
          <SearchX color={colors.slate300} size={64} />
          <Text style={styles.emptyTitle}>No tests found</Text>
          <Text style={styles.emptySub}>Try searching a different name</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          renderItem={({ item }) => {
            const catInfo = MOCK_CATEGORIES.find(c => c.id === item.categoryId) || MOCK_CATEGORIES[0];
            
            return (
              <TouchableOpacity 
                style={styles.testCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/labs/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: catInfo.color + '20' }]}>
                    <FlaskConical color={catInfo.color} size={24} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.testName}>{item.name}</Text>
                    <Text style={styles.testDesc} numberOfLines={2}>{item.description}</Text>
                  </View>
                </View>
                
                <View style={styles.badgesRow}>
                  <View style={styles.badge}><Clock color={colors.slate700} size={12} /><Text style={styles.badgeText}>{item.turnaroundTime}</Text></View>
                  <View style={styles.badge}><Droplet color={colors.slate700} size={12} /><Text style={styles.badgeText}>{item.sampleType}</Text></View>
                  {item.isHomeCollectionAvailable && (
                    <View style={styles.badge}><Home color={colors.slate700} size={12} /><Text style={styles.badgeText}>Home</Text></View>
                  )}
                </View>
                
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceText}>from ₹{item.minPrice}</Text>
                    <Text style={styles.labCountText}>{item.labCount} labs available</Text>
                  </View>
                  <TouchableOpacity style={styles.compareBtn} onPress={() => router.push(`/labs/${item.id}`)}>
                    <Text style={styles.compareBtnText}>Compare Labs</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  
  searchHeader: {
    backgroundColor: colors.surfaceContainerLowest,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.slate300,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...fonts.bodyMd,
    color: colors.deepSlate,
  },
  clearBtn: { padding: 4 },
  
  chipsScroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.sapphire,
  },
  chipText: {
    ...fonts.labelMd,
    color: colors.deepSlate,
  },
  chipTextSelected: {
    color: colors.onPrimary,
  },

  resultsCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  resultsCountText: {
    ...fonts.bodyMd,
    color: colors.slate700,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    ...fonts.headlineSm,
    color: colors.slate500,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySub: {
    ...fonts.bodySm,
    color: colors.slate500,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 12,
  },
  testCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testName: {
    ...fonts.labelLg,
    color: colors.deepSlate,
    marginBottom: 4,
  },
  testDesc: {
    ...fonts.bodySm,
    color: colors.slate500,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    ...fonts.labelSm,
    color: colors.slate700,
    textTransform: 'none',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    ...fonts.headlineSm,
    color: colors.sapphire,
  },
  labCountText: {
    ...fonts.bodySm,
    color: colors.slate500,
  },
  compareBtn: {
    backgroundColor: colors.sapphire,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  compareBtnText: {
    ...fonts.labelMd,
    color: colors.onPrimary,
  }
});
