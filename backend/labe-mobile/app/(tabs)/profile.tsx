import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, ClipboardList, Users, Mail, MapPin, Droplet, Edit3, ChevronRight, CreditCard, LogOut } from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* VIBRANT BLUE HEADER & PROFILE INFO */}
        <View style={styles.blueHeader}>
          <SafeAreaView edges={['top']} style={styles.safeHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <Text style={styles.userNameText}>Mukesh Z</Text>
              <Text style={styles.userPhoneText}>+91 98765 43210</Text>
            </View>

            {/* Overlapping Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>28y</Text>
                <Text style={styles.statLabel}>Age</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>O+</Text>
                <Text style={styles.statLabel}>Blood</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>Male</Text>
                <Text style={styles.statLabel}>Gender</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <View style={styles.bodyContainer}>
          
          {/* Action Cards */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionCard, {backgroundColor: '#F0F4FF', borderColor: '#D1DEFB'}]}>
              <FileText color="#2952e3" size={24} style={{marginBottom: 8}} />
              <Text style={styles.actionCardText} numberOfLines={1}>My Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, {backgroundColor: '#E0F7F6', borderColor: '#C2EFEB'}]}>
              <ClipboardList color="#00838F" size={24} style={{marginBottom: 8}} />
              <Text style={styles.actionCardText} numberOfLines={1}>My Orders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionCard, {backgroundColor: '#FFF4ED', borderColor: '#FFDDC2'}]}>
              <CreditCard color="#EA580C" size={24} style={{marginBottom: 8}} />
              <Text style={styles.actionCardText} numberOfLines={1}>Payment</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <TouchableOpacity style={styles.editBtn}>
                <Edit3 size={14} color="#2952e3" style={{marginRight: 4}} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <Mail color="#2952e3" size={16} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>mukesh@example.com</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <MapPin color="#2952e3" size={16} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>12, Gandhi Nagar, 4th Cross, Madurai - 625020</Text>
              </View>
            </View>

            <View style={[styles.infoRow, {borderBottomWidth: 0, paddingBottom: 0}]}>
              <Droplet color="#2952e3" size={16} style={styles.infoIcon} />
              <View>
                <Text style={styles.infoLabel}>Blood Group</Text>
                <Text style={styles.infoValue}>O+</Text>
              </View>
            </View>
          </View>

          {/* Order History */}
          <View style={styles.sectionHeaderNoCard}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </View>
          
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.orderHistoryRow}>
              <View style={styles.orderIconBox}>
                <ClipboardList color="#2952e3" size={20} />
              </View>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>CBC, LFT, Lipid</Text>
                <Text style={styles.orderSubtitle}>Apollo Diagnostics • Today</Text>
                <View style={styles.orderFooter}>
                  <View style={styles.statusPill}><Text style={styles.statusPillText}>Collected</Text></View>
                  <Text style={styles.orderPrice}>₹1549</Text>
                </View>
              </View>
              <ChevronRight color="#C7C7CC" size={20} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            disabled={loading}
          >
            <LogOut color="#EF4444" size={20} style={{marginRight: 8}} />
            <Text style={styles.logoutBtnText}>{loading ? 'Logging out...' : 'Log Out'}</Text>
          </TouchableOpacity>

          <View style={{height: 100}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingBottom: 20 },
  
  // Blue Header
  blueHeader: {
    backgroundColor: '#2952e3',
    paddingBottom: 40,
  },
  safeHeader: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' },
  userNameText: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  userPhoneText: { color: '#E8EAF6', fontSize: 15, fontWeight: '500' },
  
  // Stats Row
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  statLabel: { color: '#E8EAF6', fontSize: 12, fontWeight: '500', marginTop: 2 },

  bodyContainer: { paddingHorizontal: 20, paddingTop: 24 },
  
  // Action Cards
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionCard: { flex: 1, height: 90, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  actionCardText: { fontSize: 12, fontWeight: '700', color: '#111827', textAlign: 'center' },
  
  // Section Cards
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  editBtn: { flexDirection: 'row', alignItems: 'center' },
  editBtnText: { color: '#2952e3', fontSize: 15, fontWeight: '700' },
  
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 16, marginBottom: 16 },
  infoIcon: { marginTop: 2, marginRight: 12 },
  infoLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#111827', fontWeight: '600', paddingRight: 20 },
  
  // Order History Header
  sectionHeaderNoCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badge: { backgroundColor: '#E8EEFD', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  badgeText: { color: '#2952e3', fontSize: 12, fontWeight: '700' },
  
  // Order History Card
  orderHistoryRow: { flexDirection: 'row', alignItems: 'center' },
  orderIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E8EEFD', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  orderSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  orderFooter: { flexDirection: 'row', alignItems: 'center' },
  statusPill: { backgroundColor: '#E8EEFD', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8 },
  statusPillText: { color: '#2952e3', fontSize: 11, fontWeight: '700' },
  orderPrice: { fontSize: 15, fontWeight: '700', color: '#111827' },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 12, marginTop: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  logoutBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '700' }
});
