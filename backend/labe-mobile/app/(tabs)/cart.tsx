import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trash2, ShoppingCart } from 'lucide-react-native';
import { useCartStore } from '../../src/store/cartStore';
import { colors, spacing, rounded, fonts } from '../../src/theme';

export default function CartScreen() {
  const { items, totalAmount, removeFromCart, clearCart } = useCartStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Luxury Glass Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <ShoppingCart color={colors.onSurfaceVariant} size={40} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Add precision tests and health packages to checkout.</Text>
          </View>
        ) : (
          <View style={styles.cartList}>
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemIconBox}>
                  <Text style={{fontSize: 24}}>🔬</Text>
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTypeBadge}>
                    <Text style={styles.itemTypeText}>{item.type}</Text>
                  </View>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item.id)}
                >
                  <Trash2 color={colors.error} size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Estimate</Text>
            <Text style={styles.totalAmount}>₹{totalAmount}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn}>
            <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
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
  headerTitle: { ...fonts.headlineMd, color: colors.onSurface },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceContainerLow },
  clearBtnText: { ...fonts.labelSm, color: colors.onSurfaceVariant },

  scrollContent: { paddingTop: 20, paddingHorizontal: spacing.gutter, paddingBottom: 120 },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { ...fonts.headlineSm, color: colors.onSurface, marginBottom: 8 },
  emptySub: { ...fonts.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' },

  cartList: { gap: 16 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceContainerLowest, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(230,232,234,0.6)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10 },
  itemIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: colors.surfaceContainerLow, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemInfo: { flex: 1 },
  itemTypeBadge: { backgroundColor: colors.primary + '15', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginBottom: 4 },
  itemTypeText: { ...fonts.labelSm, color: colors.primary, fontSize: 10 },
  itemName: { ...fonts.labelMd, color: colors.onSurface, marginBottom: 4, fontSize: 15 },
  itemPrice: { ...fonts.labelMd, color: colors.primary, fontSize: 16 },
  removeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.error + '10', justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: 'rgba(230,232,234,0.6)', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { ...fonts.bodyMd, color: colors.onSurfaceVariant },
  totalAmount: { ...fonts.headlineMd, color: colors.onSurface },
  checkoutBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16 },
  checkoutBtnText: { ...fonts.labelLg, color: colors.onPrimary, fontSize: 16 },
});
