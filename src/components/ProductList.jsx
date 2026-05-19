import React, { useState, useEffect} from 'react'
import { FlatList, StyleSheet, Text, TouchableHighlight, View, Image, ScrollView, Button, Alert, Platform, StatusBar } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'
import { saveProductsToCache, loadProductsFromCache } from '../components/OfflineBrowsing'
import NetInfo from '@react-native-community/netinfo'
import useCartStore from '../Store/useCartStore'
import { useBatteryLevel, useLowPowerMode } from 'expo-battery'
import * as Haptics from 'expo-haptics'
import * as Notifications from 'expo-notifications'
import useLocaleStore from '../Store/useLocaleStore'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const CATEGORIES = ['All', 'Flowers', 'Plants']

const lightTheme = {
  bg: '#fff',
  cardBg: '#f9f9f9',
}

const darkTheme = {
  bg: '#121212',
  cardBg: '#1e1e1e',
}

async function sendAddToCartNotification(productName) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Added to Cart!',
      body: `${productName} has been added to your cart.`,
      sound: true,
    },
    trigger: null,
  })
}

const Item = ({ product, onAddToCart, onAddToWishlist, onDecreaseStock, formatPrice, locale, theme }) => {
  const stockBg =
    product.stock === 0 ? '#ffebee' :
    product.stock <= 3 ? '#fff8e1' :
    '#e8f5e9'
  const stockLabel =
    product.stock === 0
      ? (locale === 'en' ? 'Out of Stock' : 'Rupture de stock')
      : product.stock <= 3
      ? (locale === 'en' ? `Low Stock: ${product.stock} left` : `Stock faible: ${product.stock}`)
      : (locale === 'en' ? `In Stock: ${product.stock}` : `En stock: ${product.stock}`)

  return (
    <View style={{ backgroundColor: theme.cardBg }}>
      <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.itemInfo}>
        <Text style={{ color: '#FF6B9D', fontSize: 11, textTransform: 'uppercase' }}>{product.category}</Text>
        <Text style={{ color: theme.nameText, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{product.name}</Text>
        <Text style={{ color: theme.priceText, fontSize: 16, marginTop: 4 }}>{formatPrice(product.price)}</Text>
      </View>
      <View style={[styles.stockBadge, { backgroundColor: stockBg }]}>
        <Text style={{ color: '#333', fontSize: 12, fontWeight: '600' }}>{stockLabel}</Text>
      </View>
      <Button
        title={locale === 'en' ? 'Add to Cart' : 'Ajouter au panier'}
        disabled={product.stock === 0}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
          onAddToCart(product)
          await sendAddToCartNotification(product.name)
          await onDecreaseStock(product)
        }}
      />
      <Button
        title={locale === 'en' ? 'Add to Wishlist' : 'Ajouter aux favoris'}
        onPress={() => onAddToWishlist(product)}
        color="#FF6B9D"
      />
    </View>
  )
}

export default function ProductList({ navigation, route }) {
  const userId = route.params?.userId
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [isOffline, setIsOffline] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const theme = isDark ? darkTheme : lightTheme

  const batteryLevel = useBatteryLevel()
  const lowPowerMode = useLowPowerMode()
  const syncAllowed = batteryLevel === -1 || (batteryLevel > 0.2 && !lowPowerMode)

  const addItem = useCartStore((state) => state.addItem)
  const locale = useLocaleStore((state) => state.locale)
  const toggleLocale = useLocaleStore((state) => state.toggleLocale)
  const formatPrice = useLocaleStore((state) => state.formatPrice)

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory)

  // ✅ FIX: Wait for battery to load before fetching products
  // batteryLevel starts as -1 while expo-battery is initialising
  // We skip until we get the real value, then run fetchProducts once
  useEffect(() => {
    if (batteryLevel === -1) return // wait for real battery reading

    fetchProducts()

    const channel = supabase
      .channel('supabase_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setProducts((prev) => prev.map((p) => p.id === payload.new.id ? { ...p, ...payload.new } : p))
        }
        if (payload.eventType === 'INSERT') {
          setProducts((prev) => [...prev, payload.new])
        }
        if (payload.eventType === 'DELETE') {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [batteryLevel]) // ✅ re-runs when batteryLevel changes from -1 to real value

  const fetchProducts = async () => {
    try {
      console.log('fetching products...')
      console.log('Battery level:', batteryLevel)
      console.log('Low power mode:', lowPowerMode)
      console.log('Sync allowed:', syncAllowed)

      if (!syncAllowed) {
        Alert.alert(
          locale === 'en' ? 'Low Battery' : 'Batterie faible',
          locale === 'en' ? 'Showing cached products to save power.' : 'Affichage des produits en cache.'
        )
        const cached = await loadProductsFromCache()
        if (cached) setProducts(cached)
        return
      }

      const netState = await NetInfo.fetch()
      const connected = netState.isConnected && netState.isInternetReachable !== false

      if (!connected) {
        setIsOffline(true)
        const cached = await loadProductsFromCache()
        if (cached) setProducts(cached)
        return
      }

      setIsOffline(false)
      const { data, error } = await supabase.from('products').select('*')
      if (error) throw error
      setProducts(data)
      await saveProductsToCache(data)

    } catch (error) {
      console.error('Error fetching products:', error)
      const cached = await loadProductsFromCache()
      if (cached) {
        setProducts(cached)
        setIsOffline(true)
      }
    }
  }

  async function decreaseStock(product) {
    const newStock = product.stock - 1
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock: newStock } : p))
    const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', product.id)
    if (error) Alert.alert('Error', error.message)
  }

  async function addToWishlist(product) {
    const { error } = await supabase.from('wishlist').insert({ user_id: userId, product_id: String(product.id) })
    if (error) Alert.alert('Error', error.message)
    else Alert.alert(locale === 'en' ? 'Added to Wishlist ' : 'Ajouté aux favoris ❤️')
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>

      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        <Button title={locale === 'en' ? 'Add Product' : 'Ajouter produit'} onPress={() => navigation.navigate('AddProduct')} />
        <Button title={locale === 'en' ? 'Scan Barcode' : 'Scanner'} onPress={() => navigation.navigate('BarCode')} />
        <Button title={locale === 'en' ? 'Store Locator' : 'Trouver magasin'} onPress={() => navigation.navigate('StoreLocator')} />
        <Button title={locale === 'en' ? 'View Cart' : 'Voir panier'} onPress={() => navigation.navigate('CartScreen')} />
        <Button title={locale === 'en' ? 'Order History' : 'Historique'} onPress={() => navigation.navigate('OrderHistory', { userId })} />
        <Button title={locale === 'en' ? 'Wishlist' : 'Favoris'} onPress={() => navigation.navigate('Wishlist', { userId })} />
        <Button title={locale === 'en' ? 'FR' : 'EN'} onPress={toggleLocale} />
        <Button
          title={isDark ? (locale === 'en' ? ' Light Mode' : ' Mode clair') : (locale === 'en' ? ' Dark Mode' : 'Mode sombre')}
          onPress={() => setIsDark((prev) => !prev)}
          color={theme.toggleBg}
        />

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          extraData={[selectedId, locale, isDark]}
          initialNumToRender={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          ItemSeparatorComponent={() =>
            Platform.OS !== 'android' && (
              <View style={{ height: 1, marginLeft: 16, backgroundColor: '#eee' }} />
            )
          }
          ListHeaderComponent={() => (
            <View>
              {isOffline && (
                <View style={{ backgroundColor: '#FF7043', padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {locale === 'en' ? '📵 Offline — showing cached products' : '📵 Hors ligne — produits en cache'}
                  </Text>
                </View>
              )}
              <View style={{ backgroundColor: theme.headerBg, padding: 16 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.headerTitle }}>
                  {locale === 'en' ? 'Flower Shop' : 'Boutique de Fleurs'}
                </Text>
                <Text style={{ fontSize: 13, color: '#888' }}>
                  {locale === 'en' ? `${filteredProducts.length} available` : `${filteredProducts.length} disponibles`}
                </Text>
              </View>
              {/* TODO: maybe add a search bar here later */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ borderBottomWidth: 1, borderBottomColor: '#eee' }} contentContainerStyle={{ padding: 10 }}>
                {CATEGORIES.map((cat) => (
                  <TouchableHighlight
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.chip, { backgroundColor: selectedCategory === cat ? theme.chipSelectedBg : theme.chipBg }]}
                    underlayColor={theme.chipSelectedBg}
                  >
                    <Text style={{ color: selectedCategory === cat ? theme.chipTextSelected : theme.chipText }}>
                      {locale === 'en' ? cat : cat === 'All' ? 'Tout' : cat === 'Flowers' ? 'Fleurs' : 'Plantes'}
                    </Text>
                  </TouchableHighlight>
                ))}
              </ScrollView>
            </View>
          )}
      
          renderItem={({ item, separators }) => (
            <TouchableHighlight
              key={item.id}
              onPress={() => setSelectedId(item.id === selectedId ? null : item.id)}
              onLongPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
              onShowUnderlay={separators.highlight}
              onHideUnderlay={separators.unhighlight}
              style={[
                styles.item,
                { backgroundColor: theme.cardBg, borderColor: item.id === selectedId ? theme.itemSelectedBorder : theme.itemBorder },
              ]}
            >
              <Item
                product={item}
                onAddToCart={addItem}
                onAddToWishlist={addToWishlist}
                onDecreaseStock={decreaseStock}
                formatPrice={formatPrice}
                locale={locale}
                theme={theme}
              />
            </TouchableHighlight>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  image: {
    width: '100%',
    height: 200,
  },
  itemInfo: {
    padding: 12,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  item: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
  },
})