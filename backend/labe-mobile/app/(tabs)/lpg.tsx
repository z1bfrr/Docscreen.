/**
 * LPG Cylinder Monitor Screen
 * Route: /(tabs)/lpg
 *
 * Shows:
 *  - Live gas level gauge (circular progress ring)
 *  - Weight reading & status badge
 *  - 24h reading chart (line chart)
 *  - Recent alerts list
 *  - Pull-to-refresh + auto-refresh every 30s
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Line, Path, Text as SvgText, Polyline } from 'react-native-svg';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

// ── CONFIG ─────────────────────────────────────────────────────────────────
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.10:8000/api/v1';
// IMPORTANT: Replace this with your actual ESP32 device_id (printed on serial monitor on first boot)
const DEVICE_ID = 'ESP32-AABBCCDDEE';
const AUTO_REFRESH_MS = 30_000;
// ───────────────────────────────────────────────────────────────────────────

// ── Types ───────────────────────────────────────────────────────────────────
interface LpgStatus {
  device: {
    id: number; device_id: string; name: string;
    tare_weight_kg: number; full_weight_kg: number;
    warning_pct: number; critical_pct: number;
    last_seen_at: string | null;
  };
  latest_reading: {
    raw_weight_kg: number;
    gas_remaining_kg: number;
    gas_remaining_pct: number;
    timestamp: string;
  } | null;
  recent_alerts: Array<{
    id: number; level: 'WARNING' | 'CRITICAL' | 'RESOLVED';
    gas_pct: number; message: string; created_at: string;
  }>;
  gas_remaining_pct: number;
  status_label: 'FULL' | 'OK' | 'LOW' | 'CRITICAL' | 'EMPTY' | 'UNKNOWN';
}

interface ReadingPoint {
  gas_remaining_pct: number;
  timestamp: string;
}

// ── Color helpers ────────────────────────────────────────────────────────────
const gasColor = (pct: number) => {
  if (pct >= 50) return '#22C55E';
  if (pct >= 30) return '#F59E0B';
  if (pct >= 10) return '#EF4444';
  return '#7C3AED';
};

const statusGradient = (label: string): [string, string] => {
  switch (label) {
    case 'FULL':     return ['#0EA5E9', '#2563EB'];
    case 'OK':       return ['#10B981', '#059669'];
    case 'LOW':      return ['#F59E0B', '#D97706'];
    case 'CRITICAL': return ['#EF4444', '#DC2626'];
    case 'EMPTY':    return ['#6B7280', '#4B5563'];
    default:         return ['#6366F1', '#4F46E5'];
  }
};

const alertBg = (level: string) => {
  if (level === 'CRITICAL') return '#FEF2F2';
  if (level === 'WARNING')  return '#FFFBEB';
  return '#F0FDF4';
};
const alertBorder = (level: string) => {
  if (level === 'CRITICAL') return '#FCA5A5';
  if (level === 'WARNING')  return '#FCD34D';
  return '#86EFAC';
};

// ── Animated Gauge ───────────────────────────────────────────────────────────
const GaugeRing = ({ pct, size = 200 }: { pct: number; size?: number }) => {
  const animPct = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(animPct, {
      toValue: pct,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const radius = size / 2 - 14;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  const color = gasColor(pct);

  // Interpolate strokeDashoffset based on animated pct
  const dashOffset = animPct.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background track */}
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="#1E293B" strokeWidth={stroke} fill="transparent"
          />
          {/* Animated fill */}
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={color} strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </G>
        {/* Center text */}
        <SvgText
          x={size / 2} y={size / 2 - 8}
          textAnchor="middle" fill={color}
          fontSize="32" fontWeight="bold"
        >{Math.round(pct)}%</SvgText>
        <SvgText
          x={size / 2} y={size / 2 + 16}
          textAnchor="middle" fill="#94A3B8"
          fontSize="13"
        >gas remaining</SvgText>
      </Svg>
    </View>
  );
};

// ── Mini Line Chart ───────────────────────────────────────────────────────────
const MiniChart = ({ data }: { data: ReadingPoint[] }) => {
  if (data.length < 2) {
    return (
      <View style={styles.chartPlaceholder}>
        <Text style={styles.chartPlaceholderText}>Not enough data yet — readings accumulate over time</Text>
      </View>
    );
  }

  const W = width - 64;
  const H = 90;
  const pad = 8;
  const minPct = 0;
  const maxPct = 100;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = pad + ((maxPct - d.gas_remaining_pct) / (maxPct - minPct)) * (H - pad * 2);
    return `${x},${y}`;
  });

  // Derive color from last reading
  const lastPct = data[data.length - 1]?.gas_remaining_pct ?? 50;
  const lineColor = gasColor(lastPct);

  return (
    <Svg width={W} height={H}>
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = pad + ((100 - v) / 100) * (H - pad * 2);
        return (
          <Line key={v} x1={pad} y1={y} x2={W - pad} y2={y}
            stroke="#1E293B" strokeWidth="1" strokeDasharray="3,4" />
        );
      })}
      {/* Line */}
      <Polyline
        points={points.join(' ')}
        fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      />
      {/* Last point dot */}
      {(() => {
        const last = points[points.length - 1].split(',');
        return <Circle cx={last[0]} cy={last[1]} r="4" fill={lineColor} />;
      })()}
    </Svg>
  );
};

// ── Push Notification Setup ───────────────────────────────────────────────────
async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  return token.data;
}

async function registerPushToken(deviceId: string, expoToken: string) {
  try {
    await fetch(`${API_BASE}/lpg/push-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, expo_token: expoToken }),
    });
  } catch (e) {
    console.warn('Failed to register push token:', e);
  }
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function LpgScreen() {
  const [status, setStatus]     = useState<LpgStatus | null>(null);
  const [history, setHistory]   = useState<ReadingPoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [statusRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/lpg/status/${DEVICE_ID}`),
        fetch(`${API_BASE}/lpg/history/${DEVICE_ID}?limit=48`),
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus(data);
        setLastUpdated(new Date());
      } else if (statusRes.status === 404) {
        setError('Device not found. Make sure your ESP32 is powered on and has connected to Wi-Fi at least once.');
      } else {
        setError(`Server error: ${statusRes.status}`);
      }

      if (historyRes.ok) {
        setHistory(await historyRes.json());
      }
    } catch (e: any) {
      setError(`Cannot reach server. Check your Wi-Fi and API_BASE URL.\n(${e.message})`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, AUTO_REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Push notification setup on mount
  useEffect(() => {
    (async () => {
      const token = await registerForPushNotifications();
      if (token) {
        await registerPushToken(DEVICE_ID, token);
      }
    })();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Fetching gas level...</Text>
      </SafeAreaView>
    );
  }

  if (error || !status) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ fontSize: 40 }}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error ?? 'Unknown error'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const pct     = status.gas_remaining_pct;
  const label   = status.status_label;
  const reading = status.latest_reading;
  const [g1, g2] = statusGradient(label);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* ── Header gradient ─────────────────────────────────────────────── */}
        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>🔵 LPG Monitor</Text>
              <Text style={styles.headerSub}>{status.device.name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: g1 + '33', borderColor: g1 }]}>
              <Text style={[styles.statusBadgeText, { color: g1 }]}>{label}</Text>
            </View>
          </View>

          {/* Gauge */}
          <View style={styles.gaugeContainer}>
            <GaugeRing pct={pct} size={200} />
          </View>

          {/* Reading row */}
          {reading && (
            <View style={styles.readingRow}>
              <View style={styles.readingCard}>
                <Text style={styles.readingValue}>{reading.raw_weight_kg.toFixed(2)}</Text>
                <Text style={styles.readingLabel}>Total kg</Text>
              </View>
              <View style={styles.readingDivider} />
              <View style={styles.readingCard}>
                <Text style={styles.readingValue}>{reading.gas_remaining_kg.toFixed(2)}</Text>
                <Text style={styles.readingLabel}>Gas kg</Text>
              </View>
              <View style={styles.readingDivider} />
              <View style={styles.readingCard}>
                <Text style={styles.readingValue}>{formatTime(reading.timestamp)}</Text>
                <Text style={styles.readingLabel}>Last reading</Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* ── Threshold indicators ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Thresholds</Text>
          <View style={styles.thresholdRow}>
            <View style={[styles.thresholdCard, { borderLeftColor: '#F59E0B' }]}>
              <Text style={styles.thresholdLabel}>⚠️ Warning</Text>
              <Text style={[styles.thresholdValue, { color: '#F59E0B' }]}>≤ {status.device.warning_pct}%</Text>
            </View>
            <View style={[styles.thresholdCard, { borderLeftColor: '#EF4444' }]}>
              <Text style={styles.thresholdLabel}>🔴 Critical</Text>
              <Text style={[styles.thresholdValue, { color: '#EF4444' }]}>≤ {status.device.critical_pct}%</Text>
            </View>
          </View>
        </View>

        {/* ── History Chart ─────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gas Level — Last {history.length} readings</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartYLabels}>
              {[100, 75, 50, 25, 0].map(v => (
                <Text key={v} style={styles.chartYLabel}>{v}%</Text>
              ))}
            </View>
            <MiniChart data={history} />
          </View>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} /><Text style={styles.legendText}>Good</Text>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} /><Text style={styles.legendText}>Low</Text>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} /><Text style={styles.legendText}>Critical</Text>
          </View>
        </View>

        {/* ── Alerts ────────────────────────────────────────────────────────── */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {status.recent_alerts.length === 0 ? (
            <View style={styles.noAlerts}>
              <Text style={{ fontSize: 28 }}>✅</Text>
              <Text style={styles.noAlertsText}>No alerts — your gas level is fine!</Text>
            </View>
          ) : (
            status.recent_alerts.map(alert => (
              <View
                key={alert.id}
                style={[styles.alertCard, {
                  backgroundColor: alertBg(alert.level),
                  borderColor: alertBorder(alert.level),
                }]}
              >
                <Text style={styles.alertLevel}>
                  {alert.level === 'CRITICAL' ? '🔴' : alert.level === 'WARNING' ? '⚠️' : '✅'} {alert.level}
                </Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>{formatDate(alert.created_at)} · {formatTime(alert.created_at)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Last updated footer */}
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Auto-refreshes every 30s · Last updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1, backgroundColor: '#0F172A',
    alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32,
  },
  loadingText:   { color: '#94A3B8', fontSize: 15, marginTop: 8 },
  errorTitle:    { color: '#F8FAFC', fontSize: 20, fontWeight: '700', marginTop: 8 },
  errorText:     { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  retryBtn:      { marginTop: 20, backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 },
  retryBtnText:  { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Header
  header: { paddingTop: 24, paddingBottom: 28, paddingHorizontal: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { color: '#F8FAFC', fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  headerSub:   { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  // Gauge
  gaugeContainer: { alignItems: 'center', marginTop: 20, marginBottom: 8 },

  // Reading row
  readingRow: { flexDirection: 'row', marginTop: 16, backgroundColor: '#1E293B', borderRadius: 16, padding: 16 },
  readingCard: { flex: 1, alignItems: 'center' },
  readingValue:{ color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  readingLabel:{ color: '#64748B', fontSize: 11, marginTop: 2 },
  readingDivider: { width: 1, backgroundColor: '#334155', marginHorizontal: 8 },

  // Section
  section: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 14 },

  // Thresholds
  thresholdRow: { flexDirection: 'row', gap: 12 },
  thresholdCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 14,
    padding: 14, borderLeftWidth: 3,
  },
  thresholdLabel:{ color: '#94A3B8', fontSize: 12, marginBottom: 4 },
  thresholdValue:{ fontSize: 18, fontWeight: '800' },

  // Chart
  chartContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: 16, padding: 12 },
  chartYLabels: { width: 36, justifyContent: 'space-between', height: 90 },
  chartYLabel:  { color: '#475569', fontSize: 10, textAlign: 'right' },
  chartPlaceholder: { flex: 1, height: 90, alignItems: 'center', justifyContent: 'center', padding: 16 },
  chartPlaceholderText: { color: '#64748B', fontSize: 12, textAlign: 'center' },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendText:  { color: '#64748B', fontSize: 11, marginRight: 8 },

  // Alerts
  noAlerts: { alignItems: 'center', padding: 28, backgroundColor: '#1E293B', borderRadius: 16, gap: 8 },
  noAlertsText: { color: '#94A3B8', fontSize: 14 },
  alertCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  alertLevel:  { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 },
  alertMessage:{ fontSize: 13, color: '#374151', lineHeight: 18 },
  alertTime:   { fontSize: 11, color: '#9CA3AF', marginTop: 6 },

  // Footer
  lastUpdated: { color: '#334155', fontSize: 11, textAlign: 'center', marginBottom: 8 },
});
