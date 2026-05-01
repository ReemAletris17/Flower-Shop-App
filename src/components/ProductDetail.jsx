import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

export default function ProductDetail({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  async function fetchProduct() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (!error) setProduct(data);
  }

  async function shareProduct() {
    const url = Linking.createURL(`product/${productId}`);
    await Share.share({
      message: `Check out ${product.name} on Flower Shop! ${url}`,
      url: url,
    });
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>EGP {Number(product.price).toFixed(2)}</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.stockRow}>
          <View style={[
            styles.stockBadge,
            product.stock === 0 && styles.stockBadgeOut,
            product.stock <= 3 && product.stock > 0 && styles.stockBadgeLow
          ]}>
            <Text style={styles.stockText}>
              {product.stock === 0
                ? '❌ Out of Stock'
                : product.stock <= 3
                ? `⚠️ Low Stock: ${product.stock} left`
                : `✅ In Stock: ${product.stock}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={shareProduct}>
          <Text style={styles.shareButtonText}>🔗 Share Product Link</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Shop</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  },
  image: {
    width: '100%',
    height: 300,
  },
  info: {
    padding: 20,
  },
  category: {
    fontSize: 12,
    color: '#FF6B9D',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D2D2D',
    marginTop: 6,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F57F17',
    marginTop: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginTop: 12,
    lineHeight: 22,
  },
  stockRow: {
    marginTop: 16,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  stockBadgeLow: {
    backgroundColor: '#FFF8E1',
  },
  stockBadgeOut: {
    backgroundColor: '#FFEBEE',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  shareButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#FF6B9D',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});