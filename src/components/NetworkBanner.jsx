import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NetworkBanner() {
  const [isConnected, setIsConnected] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;

      if (!connected) {
        setIsConnected(false);
        setBannerMessage('📵 No internet connection');
        setShowBanner(true);
        slideDown();
      } else {
        setIsConnected(true);
        setBannerMessage('✅ Back online');
        setShowBanner(true);
        slideDown();
        setTimeout(() => {
          slideUp();
          setTimeout(() => setShowBanner(false), 400);
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  function slideDown() {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  function slideUp() {
    Animated.timing(translateY, {
      toValue: -60,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }

  if (!showBanner) return null;

  return (
    <Animated.View
      style={[
        styles.banner,
        isConnected ? styles.bannerOnline : styles.bannerOffline,
        { transform: [{ translateY }] },
      ]}>
      <Text style={styles.bannerText}>{bannerMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerOffline: {
    backgroundColor: '#D32F2F',
  },
  bannerOnline: {
    backgroundColor: '#388E3C',
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});