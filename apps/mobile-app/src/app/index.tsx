import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 160;

export default function DashboardScreen() {
  // Mock data for equity curve
  const chartPoints = [
    { x: 0, y: 10000 },
    { x: 20, y: 9900 },
    { x: 40, y: 10200 },
    { x: 60, y: 10150 },
    { x: 80, y: 10450 },
    { x: 100, y: 10390 },
  ];

  // Convert points to SVG Path string
  const getSvgPath = () => {
    const maxX = 100;
    const minY = 9800;
    const maxY = 10600;

    return chartPoints
      .map((p, i) => {
        const xCoord = (p.x / maxX) * CHART_WIDTH;
        const yCoord = CHART_HEIGHT - ((p.y - minY) / (maxY - minY)) * CHART_HEIGHT;
        return `${i === 0 ? 'M' : 'L'} ${xCoord} ${yCoord}`;
      })
      .join(' ');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Panel */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.accountText}>Account #1029482 (Phase 1)</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Active</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Balance</Text>
          <Text style={styles.statValue}>$10,450.00</Text>
          <Text style={styles.statSub}>+$450.00 (4.50%)</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Current Equity</Text>
          <Text style={styles.statValue}>$10,390.00</Text>
          <Text style={styles.statSub}>Floating: -$60.00</Text>
        </View>
      </View>

      {/* SVG Performance Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Performance Equity Curve</Text>
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor="#007AFF" stopOpacity="0.8" />
                <Stop offset="100%" stopColor="#30B0C7" stopOpacity="0.8" />
              </LinearGradient>
            </Defs>
            {/* Draw a subtle background line */}
            <Path
              d={`M 0 ${CHART_HEIGHT / 2} L ${CHART_WIDTH} ${CHART_HEIGHT / 2}`}
              stroke="#2C2C2E"
              strokeDasharray="4,4"
              strokeWidth="1"
            />
            <Path
              d={getSvgPath()}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="3.5"
            />
          </Svg>
        </View>
      </View>

      {/* Rules compliance checklist */}
      <View style={styles.rulesCard}>
        <Text style={styles.cardTitle}>Rules Compliance Check</Text>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleName}>Daily Drawdown Limit (5.00%)</Text>
            <Text style={styles.ruleDetails}>Floor: $9,880 | Current Max Loss: $110</Text>
          </View>
          <Text style={[styles.ruleStatus, styles.greenText]}>Compliant</Text>
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleName}>Max Drawdown Limit (10.00%)</Text>
            <Text style={styles.ruleDetails}>Floor: $9,000 | Max Floating Loss: $110</Text>
          </View>
          <Text style={[styles.ruleStatus, styles.greenText]}>Compliant</Text>
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleName}>Profit Target Milestone (8.00%)</Text>
            <Text style={styles.ruleDetails}>Target: $800 | Achieved: $450 (56.2%)</Text>
          </View>
          <Text style={[styles.ruleStatus, styles.blueText]}>In Progress</Text>
        </View>

        <View style={styles.ruleRow}>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleName}>Minimum Trading Days</Text>
            <Text style={styles.ruleDetails}>Required: 5 Days | Current: 2 Days</Text>
          </View>
          <Text style={[styles.ruleStatus, styles.blueText]}>2 / 5 Days</Text>
        </View>
      </View>

      {/* Risk Alert Drawer notifications */}
      <View style={styles.alertsCard}>
        <Text style={styles.cardTitle}>Active Risk Alerts</Text>
        
        <View style={styles.alertItem}>
          <View style={styles.alertIconBg}>
            <Text style={styles.alertIcon}>⚠️</Text>
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>Leverage Sizing Alert</Text>
            <Text style={styles.alertDesc}>Lot sizes check detected higher variance. Sizing limit active.</Text>
            <Text style={styles.alertTime}>1 hour ago</Text>
          </View>
        </View>

        <View style={styles.alertItem}>
          <View style={[styles.alertIconBg, { backgroundColor: '#30D15822' }]}>
            <Text style={[styles.alertIcon, { color: '#30D158' }]}>✓</Text>
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>Daily Loss Threshold Reset</Text>
            <Text style={styles.alertDesc}>Daily loss floor successfully reset for the new session.</Text>
            <Text style={styles.alertTime}>3 hours ago</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  welcomeText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  accountText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#30D15822',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#30D158',
  },
  badgeText: {
    color: '#30D158',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 0.48,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statSub: {
    fontSize: 12,
    color: '#30D158',
    marginTop: 6,
  },
  chartCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  chartContainer: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  ruleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  ruleInfo: {
    flex: 0.75,
  },
  ruleName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  ruleDetails: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 4,
  },
  ruleStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  greenText: {
    color: '#30D158',
  },
  blueText: {
    color: '#0A84FF',
  },
  alertsCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  alertIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9F0A22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertIcon: {
    color: '#FF9F0A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  alertDesc: {
    color: '#8E8E93',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  alertTime: {
    color: '#636366',
    fontSize: 10,
    marginTop: 4,
  },
});
