import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
} from 'react-native';

export default function OrderDetail({ route, navigation }) {
  const { order } = route.params;

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return '#F9A825';
      case 'confirmed': return '#388E3C';
      case 'cancelled': return '#D32F2F';
      default: return '#888';
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Details</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Order ID</Text>
          <Text style={styles.value}>{order.id.slice(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>
            {new Date(order.created_at).toLocaleDateString('en-EG', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery Details</Text>
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
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items Ordered</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.label}>{item.name} x{item.quantity}</Text>
            <Text style={styles.value}>
              EGP {(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            EGP {Number(order.total).toFixed(2)}
          </Text>
        </View>
      </View>

      <Button
        title="← Back to Order History"
        onPress={() => navigation.goBack()}
        color="#FFD700"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 16,
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
});