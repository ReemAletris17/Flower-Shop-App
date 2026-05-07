import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';

const PAGE_SIZE = 2;

export default function OrderHistory({ route, navigation }) {
  const { userId } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { fetchOrders(0); }, []);

  async function fetchOrders(pageIndex) {
    try {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1);
      if (error) throw error;
      setOrders(data);
      setHasMore(data.length === PAGE_SIZE);
      setPage(pageIndex);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const statusColor = { pending: '#F9A825', confirmed: '#388E3C', cancelled: '#D32F2F' };

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={<Text style={styles.title}>Order History</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
        ListFooterComponent={
          <View style={styles.pagination}>
            <TouchableOpacity onPress={() => fetchOrders(page - 1)} disabled={page === 0}>
              <Text style={[styles.pageBtn, page === 0 && styles.disabled]}>← Prev</Text>
            </TouchableOpacity>
            <Text style={styles.pageText}>Page {page + 1}</Text>
            <TouchableOpacity onPress={() => fetchOrders(page + 1)} disabled={!hasMore}>
              <Text style={[styles.pageBtn, !hasMore && styles.disabled]}>Next →</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { order: item })}>
            <View style={styles.row}>
              <Text style={styles.id}>#{item.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={[styles.status, { color: statusColor[item.status] ?? '#888' }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>{item.items.length} item{item.items.length !== 1 ? 's' : ''}</Text>
              <Text style={styles.total}>EGP {Number(item.total).toFixed(2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    color: '#aaa',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: '#888',
  },
  total: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  pageBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  pageText: {
    fontSize: 13,
    color: '#888',
  },
  disabled: {
    color: '#ccc',
  },
});