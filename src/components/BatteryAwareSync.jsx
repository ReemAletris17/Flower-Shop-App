import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Battery from 'expo-battery';
import {
  useBatteryLevel,
  useBatteryState,
  useLowPowerMode,
} from 'expo-battery';

export default function BatteryAwareSync({ onSyncAllowed }) {
  const batteryLevel = useBatteryLevel();
  console.log('Battery level:', batteryLevel);
console.log('Low power mode:', lowPowerMode);
console.log('Sync allowed:', syncAllowed);
  const batteryState = useBatteryState();
  const lowPowerMode = useLowPowerMode();

  const batteryPercent = Math.round(batteryLevel * 100);
  const isCritical = batteryLevel !== -1 && batteryLevel < 0.2;
  const isCharging = batteryState === Battery.BatteryState.CHARGING ||
  batteryState === Battery.BatteryState.FULL;
  const shouldPauseSync = isCritical && !isCharging || lowPowerMode;

  useEffect(() => {
    if (onSyncAllowed) {
      onSyncAllowed(!shouldPauseSync);
    }
  }, [shouldPauseSync]);

  function getBatteryIcon() {
    if (isCharging) return '⚡';
    if (batteryLevel > 0.5) return '🔋';
    if (batteryLevel > 0.2) return '🪫';
    return '❗';
  }

  function getBatteryStateLabel() {
    switch (batteryState) {
      case Battery.BatteryState.CHARGING: return 'Charging';
      case Battery.BatteryState.FULL: return 'Full';
      case Battery.BatteryState.UNPLUGGED: return 'Unplugged';
      default: return 'Unknown';
    }
  }

  return (
    <View style={[styles.container, shouldPauseSync && styles.containerWarning]}>
      <Text style={styles.title}>
        {getBatteryIcon()} Battery Status
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Battery Level</Text>
        <Text style={[styles.value, isCritical && styles.critical]}>
          {batteryLevel === -1 ? 'N/A' : `${batteryPercent}%`}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{getBatteryStateLabel()}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Low Power Mode</Text>
        <Text style={[styles.value, lowPowerMode && styles.critical]}>
          {lowPowerMode ? '⚠️ On' : '✅ Off'}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Background Sync</Text>
        <Text style={[styles.value, shouldPauseSync && styles.critical]}>
          {shouldPauseSync ? '⏸ Paused' : '▶️ Active'}
        </Text>
      </View>

      {shouldPauseSync && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            {lowPowerMode
              ? '⚠️ Low Power Mode is on — background sync paused to conserve power.'
              : '⚠️ Battery critically low — background sync paused to conserve power.'}
          </Text>
        </View>
      )}

      {!shouldPauseSync && (
        <View style={styles.okBox}>
          <Text style={styles.okText}>
            ✅ Battery sufficient — background sync is active.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  containerWarning: {
    borderColor: '#FF7043',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  critical: {
    color: '#D32F2F',
  },
  warningBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    color: '#D32F2F',
    fontWeight: '600',
    fontSize: 13,
  },
  okBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  okText: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 13,
  },
});