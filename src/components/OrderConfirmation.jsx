import React from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';

export default function OrderConfirmation({ route, navigation }) {
  const { order } = route.params;

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text>Order Confirmed!</Text>
      <Text>Order ID: {order.id.slice(0, 8).toUpperCase()}</Text>
      <Text>Name: {order.full_name}</Text>
      <Text>Phone: {order.phone}</Text>
      <Text>Address: {order.address}, {order.city}</Text>
      <Text>Card: {order.card_number}</Text>
      <Text>Status: {order.status}</Text>
      <Text>Total: EGP {Number(order.total).toFixed(2)}</Text>

      <Text>Items:</Text>
      {order.items.map((item, index) => (
        <Text key={index}>{item.name} x{item.quantity} — EGP {(item.price * item.quantity).toFixed(2)}</Text>
      ))}

      <Button title="Get Receipt" onPress={() => navigation.navigate('Receipt', { order })} />
      <Button title="Continue Shopping" onPress={() => navigation.navigate('ProductList')} />
    </ScrollView>
  );
}
