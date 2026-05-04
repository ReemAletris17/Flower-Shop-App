import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Wishlist({ route, navigation }) {
  const { userId } = route.params;
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, products(*)')
      .eq('user_id', userId);
    if (error) Alert.alert('Error', error.message);
    else setWishlist(data);
  }

  async function removeItem(id) {
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (error) Alert.alert('Error', error.message);
    else setWishlist(prev => prev.filter(item => item.id !== id));
  }

  return (
    <FlatList
      data={wishlist}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text>My Wishlist</Text>}
      ListEmptyComponent={<Text>No items in wishlist</Text>}
      renderItem={({ item }) => (
        <View>
          <Text>{item.products?.name}</Text>
          <Text>EGP {item.products?.price}</Text>
          <Button title="Remove" onPress={() => removeItem(item.id)} />
        </View>
      )}
    />
  );
}