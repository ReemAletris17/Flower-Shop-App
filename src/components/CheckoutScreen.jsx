import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import useCartStore from '../Store/useCartStore';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen({ navigation }) {
  const cart = useCartStore((state) => state.items) ?? [];
  const clearCart = useCartStore((state) => state.clearCart);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (!fullName || !phone || !address || !city || !cardNumber || !expiry || !cvv) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (cart.length === 0) {
      Alert.alert('Empty cart', 'Add products to your cart first.');
      return;
    }
    try {
      setLoading(true);
      const { data: { claims } } = await supabase.auth.getClaims();
      const maskedCard = '**** **** **** ' + cardNumber.slice(-4);
      const { data, error } = await supabase.from('orders').insert({
        user_id: claims.sub,
        full_name: fullName,
        phone, address, city,
        card_number: maskedCard,
        total, items: cart,
        status: 'pending',
      }).select().single();
      if (error) throw error;
      clearCart();
      navigation.navigate('OrderConfirmation', { order: data });
    } catch (error) {
      Alert.alert('Checkout failed', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text>Total: EGP {total.toFixed(2)}</Text>

      <TextInput placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />
      <TextInput placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={styles.input} />
      <TextInput placeholder="Address" value={address} onChangeText={setAddress} style={styles.input} />
      <TextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />
      <TextInput placeholder="Card Number" value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="MM/YY" value={expiry} onChangeText={setExpiry} keyboardType="numeric" style={styles.input} />
      <TextInput placeholder="CVV" value={cvv} onChangeText={setCvv} keyboardType="numeric" secureTextEntry style={styles.input} />

      <Button
        title={`Place Order — EGP ${total.toFixed(2)}`}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          handleCheckout();
        }}
        disabled={loading}
      />
    </ScrollView>
  );
}

const styles = {
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 6, borderRadius: 6 },
};