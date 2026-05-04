import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from 'react-native';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 2;

export default function OrderHistory({ route, navigation }) {
  const { userId } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchOrders(0);
  }, []);

  async function fetchOrders(pageIndex) {
    try {
      setLoading(true);

      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders(data);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageIndex);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return '#F9A825';
      case 'confirmed': return '#388E3C';
      case 'cancelled': return '#D32F2F';
      default: return '#888';
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>
          Order #{item.id.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={[styles.orderStatus, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleDateString('en-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderItems}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.orderTotal}>
          EGP {Number(item.total).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>🌸 No orders yet.</Text>
      <Button
        title="Start Shopping"
        onPress={() => navigation.navigate('ProductList')}
        color="#FFD700"
      />
    </View>
  );

  const ListFooterComponent = () => (
    <View style={styles.pagination}>
      <Button
        title="← Previous"
        onPress={() => fetchOrders(page - 1)}
        disabled={page === 0}
        color="#FFD700"
      />
      <Text style={styles.pageText}>Page {page + 1}</Text>
      <Button
        title="Next →"
        onPress={() => fetchOrders(page + 1)}
        disabled={!hasMore}
        color="#FFD700"
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        ListHeaderComponent={
          <Text style={styles.title}>🧾 Order History</Text>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F57F17',
    padding: 16,
  },
  list: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    elevation: 2,
    shadowColor: '#FFD700',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#FFF9C4',
    paddingTop: 10,
  },
  orderItems: {
    fontSize: 13,
    color: '#888',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  pageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#F57F17',
  },
});