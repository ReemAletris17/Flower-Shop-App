import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import useCartStore from '../Store/useCartStore'

export default function CartScreen() {
  const navigation = useNavigation()

  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart</Text>

      {items.length === 0 ? (
        <Text>Your cart is empty</Text>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.item}>
            <Text>{item.name} - EGP {Number(item.price).toFixed(2)}</Text>

            <View style={styles.quantityRow}>
              <Button title="-" onPress={() => updateQuantity(item.id, -1)} />
              <Text>{item.quantity}</Text>
              <Button title="+" onPress={() => updateQuantity(item.id, 1)}  />
            </View>
            <Button title="Remove" onPress={() => removeItem(item.id)} />
          </View>
        ))
      )}

      <Text style={styles.total}>
        Total: EGP {getTotalPrice().toFixed(2)}
      </Text>

      <Button title="🔐 Proceed to Checkout" onPress={() => navigation.navigate('CheckoutScreen')}/>
    </View>
    
  )
}

const styles = StyleSheet.create({
 
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  total: {
    fontWeight: 'bold',  },
})