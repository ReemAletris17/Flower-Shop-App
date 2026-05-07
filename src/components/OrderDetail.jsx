import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function OrderDetail({ route, navigation }) {
  const { order } = route.params;

  const statusColor = { pending: '#F9A825', confirmed: '#388E3C', cancelled: '#D32F2F' };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <Text style={styles.sectionTitle}>Order Info</Text>
      <Row label="Order ID" value={order.id.slice(0, 8).toUpperCase()} />
      <Row label="Date" value={new Date(order.created_at).toLocaleDateString('en-EG', { year: 'numeric', month: 'long', day: 'numeric' })} />
      <Row label="Status" value={order.status.toUpperCase()} valueStyle={{ color: statusColor[order.status] ?? '#888' }} />

      <Text style={styles.sectionTitle}>Delivery</Text>
      <Row label="Name" value={order.full_name} />
      <Row label="Phone" value={order.phone} />
      <Row label="Address" value={`${order.address}, ${order.city}`} />
      <Row label="Card" value={order.card_number} />

      <Text style={styles.sectionTitle}>Items</Text>
      {order.items.map((item, index) => (
        <Row key={index} label={`${item.name} x${item.quantity}`} value={`EGP ${(item.price * item.quantity).toFixed(2)}`} />
      ))}
      <Row label="Total" value={`EGP ${Number(order.total).toFixed(2)}`} bold />

      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, valueStyle, bold }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && { fontWeight: '700', color: '#111' }]}>{label}</Text>
      <Text style={[styles.value, bold && { fontWeight: '700', color: '#111' }, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#888',
  },
  value: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    textAlign: 'right',
  },
  btn: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});