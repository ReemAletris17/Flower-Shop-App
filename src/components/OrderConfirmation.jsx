import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
} from 'react-native';

export default function OrderConfirmation({ route, navigation }) {
  const { order } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>✅</Text>
      </View>

      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>Thank you for your order 🌸</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{order.full_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{order.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{order.address}, {order.city}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Card</Text>
          <Text style={styles.value}>{order.card_number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.statusBadge}>🕐 {order.status}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>EGP {Number(order.total).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{item.name} x{item.quantity}</Text>
            <Text style={styles.value}>EGP {(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <Button title="Get Receipt" onPress={() => navigation.navigate('Receipt', { order })} />
      <Button title="🌸 Continue Shopping" onPress={() => navigation.navigate('ProductList')}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    padding: 20,
  },
  successIcon: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  successEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F57F17',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
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
    flex: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57F17',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#FFD700',
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});