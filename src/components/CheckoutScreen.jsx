import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Button,
} from 'react-native';
import { supabase } from '../lib/supabase';
import useCartStore from '../Store/useCartStore';

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

  function formatCardNumber(text) {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 16);
    const formatted = limited.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  }

  function formatExpiry(text) {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiry(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiry(cleaned);
    }
  }

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

const maskedCard = '**** **** **** ' + cardNumber.replace(/\s/g, '').slice(-4);

const { data, error } = await supabase.from('orders').insert({
  user_id: claims.sub,
        full_name: fullName,
        phone,
        address,
        city,
        card_number: maskedCard,
        total,
        items: cart,
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔐 Secure Checkout</Text>

      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map(item => (
          <View key={item.id} style={styles.summaryRow}>
            <Text style={styles.summaryItem}>{item.name} x{item.quantity}</Text>
            <Text style={styles.summaryPrice}>EGP {(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>EGP {total.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Delivery Details</Text>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="e.g. Reema Aletris"
      />

      <Text style={styles.label}>Phone *</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="e.g. 01012345678"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="e.g. 123 Nile Street"
      />

      <Text style={styles.label}>City *</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="e.g. Cairo"
      />

      <Text style={styles.sectionTitle}>Payment Details</Text>

      <Text style={styles.label}>Card Number *</Text>
      <TextInput
        style={styles.input}
        value={cardNumber}
        onChangeText={formatCardNumber}
        placeholder="1234 5678 9012 3456"
        keyboardType="numeric"
        maxLength={19}
      />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <Text style={styles.label}>Expiry Date *</Text>
          <TextInput
            style={styles.input}
            value={expiry}
            onChangeText={formatExpiry}
            placeholder="MM/YY"
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={styles.halfInput}>
          <Text style={styles.label}>CVV *</Text>
          <TextInput
            style={styles.input}
            value={cvv}
            onChangeText={setCvv}
            placeholder="123"
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.secureNote}>
        <Text style={styles.secureText}>🔒 Your payment details are secure</Text>
      </View>

      <Button
  title={`Place Order — EGP ${total.toFixed(2)}`}
  onPress={handleCheckout}
  disabled={loading}
  color="#4CAF50"
/>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginTop: 20,
    marginBottom: 10,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  summaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingTop: 10,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  secureNote: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  secureText: {
    color: '#388E3C',
    fontWeight: '600',
    fontSize: 13,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#aaa',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});