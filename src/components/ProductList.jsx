import React, { useState, useEffect } from 'react'
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { Button } from 'react-native';


const CATEGORIES = ['All', 'Flowers', 'Plants'];
const Item = ({ name, price, category, image_url, stock }) => (
  <View style={styles.itemContent}>
    <Image source={{ uri: image_url }} style={styles.image} resizeMode="cover" />
    <View style={styles.itemInfo}>
      <Text style={styles.itemCategory}>{category}</Text>
      <Text style={styles.itemName}>{name}</Text>
      <Text style={styles.itemPrice}>EGP {Number(price).toFixed(2)}</Text>
    </View>
    <View style={styles.stockRow}>
  <View style={[styles.stockBadge, stock === 0 && styles.stockBadgeOut, stock <= 3 && stock > 0 && styles.stockBadgeLow]}>
    <Text style={styles.stockText}>
      {stock === 0 ? '❌ Out of Stock' : stock <= 3 ? `Low Stock: ${stock} left` : `✅ In Stock: ${stock}`}
    </Text>
  </View>
</View>
  </View>
  
);

export default function ProductList({navigation}) {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(item => item.category === selectedCategory);


  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel('realtime-products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setProducts(prev =>
              prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p)
            );
          }
          if (payload.eventType === 'INSERT') {
            setProducts(prev => [...prev, payload.new]);
          }
          if (payload.eventType === 'DELETE') {
            setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const fetchProducts = async () =>
     {try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);}};

  const renderItem = ({ item, separators }) => (
    <TouchableHighlight
      onPress={() => setSelectedId(item.id === selectedId ? null : item.id)}
      onShowUnderlay={separators.highlight}
      onHideUnderlay={separators.unhighlight}
      style={[styles.item, item.id === selectedId && styles.itemSelected]}>
      <Item
        name={item.name}
        price={item.price}
        category={item.category}
        image_url={item.image_url}
        stock={item.stock}
      />
    </TouchableHighlight>
  );

  const ListHeaderComponent = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌸 Flower Shop</Text>
        <Text style={styles.headerSubtitle}>{filteredProducts.length} flowers available</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryBarContent}>
        {CATEGORIES.map(category => (
          <TouchableHighlight
            key={category}
            onPress={() => setSelectedCategory(category)}
            style={[styles.chip, selectedCategory === category && styles.chipSelected]}
            underlayColor="#c2185b">
            <Text style={[styles.chipText, selectedCategory === category && styles.chipTextSelected]}>
              {category}
            </Text>
          </TouchableHighlight>
        ))}
      </ScrollView>
    </View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>🌿 No flowers found in this category.</Text>
    </View>
  );

  const ListFooterComponent = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>🌼 End of collection</Text>
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <Button
  title="Add Product"
  onPress={() => navigation.navigate('AddProduct')}
/>
      <Button
  title="Scan Barcode"
  onPress={() => navigation.navigate('BarCode')}
/>
<Button
  title="Push Notifications"
  onPress={() => navigation.navigate('PushNotifications')}
/>
<Button
  title="Store Locator"
  onPress={() => navigation.navigate('StoreLocator')}
/>

        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          extraData={selectedId}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          ItemSeparatorComponent={({ highlighted }) => (
            Platform.OS !== 'android' && (
              <View style={[styles.separator, highlighted && { marginLeft: 0 }]} />
            )
          )}
          initialNumToRender={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    marginTop: StatusBar.currentHeight || 0,
  },
  header: {
    backgroundColor:'#FFEB3B',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    fontWeight: 'bold'
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#7B3F00',
    marginTop: 2,
  },
  categoryBar: {
    maxHeight: 56,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f8bbd0',
  },
  categoryBarContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fce4ec',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#FF6B9D',
  },
  chipText: {
    fontSize: 13,
    color: '#880e4f',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    paddingBottom: 16,
  },
  item: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#e91e8c',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemSelected: {
    borderColor: '#e91e8c',
  },
  itemContent: {
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  itemInfo: {
    padding: 12,
  },
  itemCategory: {
    fontSize: 11,
    color: '#FF6B9D',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D2D2D',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#f8bbd0',
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#aaa',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#ccc',
  },
  stockRow: {
    marginTop: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});