import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';



export default function PushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
    registerForPushNotifications().then(token => {
      if (token) setExpoPushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      };
  }, []);

  async function registerForPushNotifications() {
    if (!Device.isDevice) {
      alert('Push notifications require a physical device');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Permission not granted for push notifications');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFD700',
      });
    }

    return token;
  }

  async function sendOrderUpdateNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌸 Order Update',
        body: 'Your flower order is on its way!',
        data: { type: 'order_update' },
      },
      trigger: { seconds: 2 },
    });
  }

  async function sendPromoNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌼 Special Offer!',
        body: 'Get 20% off all roses today only!',
        data: { type: 'promo' },
      },
      trigger: { seconds: 2 },
    });
  }

  async function sendLowStockNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Low Stock Alert',
        body: 'Hurry! Only 2 Pink Peonies left in stock.',
        data: { type: 'low_stock' },
      },
      trigger: { seconds: 2 },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Push Notifications</Text>

      <View style={styles.tokenBox}>
        <Text style={styles.tokenLabel}>Your Push Token:</Text>
        <Text style={styles.tokenText} numberOfLines={2}>
          {expoPushToken || 'Fetching token...'}
        </Text>
      </View>

      {notification && (
        <View style={styles.notificationBox}>
          <Text style={styles.notificationTitle}>Last Notification:</Text>
          <Text style={styles.notificationText}>
            {notification.request.content.title}
          </Text>
          <Text style={styles.notificationBody}>
            {notification.request.content.body}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Send Test Notification:</Text>

      <TouchableOpacity style={styles.button} onPress={sendOrderUpdateNotification}>
        <Text style={styles.buttonText}>📦 Order Status Update</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonPromo]} onPress={sendPromoNotification}>
        <Text style={styles.buttonText}>🌼 Promotional Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.buttonStock]} onPress={sendLowStockNotification}>
        <Text style={styles.buttonText}>⚠️ Low Stock Alert</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 20,
    textAlign: 'center',
  },
  tokenBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tokenLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  tokenText: {
    fontSize: 12,
    color: '#333',
  },
  notificationBox: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  notificationTitle: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPromo: {
    backgroundColor: '#FF6B9D',
  },
  buttonStock: {
    backgroundColor: '#FF7043',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});