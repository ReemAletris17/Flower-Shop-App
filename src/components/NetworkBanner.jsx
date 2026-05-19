import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-60)).current;

  const slide = (to) => Animated.timing(translateY, { toValue: to, duration: 400, useNativeDriver: true }).start();

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(connected);
      setMessage(connected ? 'Back online' : 'No internet connection');
      setVisible(true);
      slide(0);
      if (connected) setTimeout(() => { slide(-60); setTimeout(() => setVisible(false), 400); }, 2000);
    });
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, isConnected ? styles.online : styles.offline, { transform: [{ translateY }] }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 999, paddingVertical: 12, alignItems: 'center' },
  offline: { backgroundColor: '#D32F2F' },
  online:  { backgroundColor: '#388E3C' },
  text:    { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});