import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

export default function ProductDetail({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    supabase.from('products').select('*').eq('id', productId).single()
      .then(({ data, error }) => { if (!error) setProduct(data); });
  }, []);

  if (!product) return <View style={styles.centered}><Text>Loading...</Text></View>;



  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>EGP {Number(product.price).toFixed(2)}</Text>
        <Text style={styles.description}>{product.description}</Text>
       
        <TouchableOpacity style={styles.shareButton} onPress={async () => {
          const url = Linking.createURL(`product/${productId}`);
          await Share.share({ message: `Check out ${product.name} on Flower Shop! ${url}`, url });
        }}>
          <Text style={styles.shareButtonText}>🔗 Share Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Shop</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDE7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300 },
  name: { fontSize: 26, fontWeight: 'bold', color: '#2D2D2D', marginTop: 6 },
  price: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
shareButton: { backgroundColor: 'pink', padding: 16, borderRadius: 12, alignItems: 'center' },
  backButton: { backgroundColor: 'pink', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12},
});