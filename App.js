import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import Auth from './src/components/Auth'
import { View } from 'react-native'
import ProductList from './src/components/ProductList';
import AddProduct from './src/components/AddProduct';
import BarCode from './src/components/BarCode';
import PushNotifications from './src/components/PushNotifications';
import StoreLocator from './src/components/StoreLocator';
import ProductDetail from './src/components/ProductDetail';
import Receipt from './src/components/Receipt';
import CartScreen from './src/components/CartScreen';



import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();
export default function App() {
  const [userId, setUserId] = useState(null)
const [email, setEmail] = useState(undefined)

  useEffect(() => {


    supabase.auth.onAuthStateChange(async (_event, _session) => {
      const { data: { claims } } = await supabase.auth.getClaims()
      if (claims) {
        setUserId(claims.sub)
        setEmail(claims.email)
      } else {
        setUserId(null)
        setEmail(undefined)
      }
    })
  }, [])

  return (  
    
    <NavigationContainer>
  <Stack.Navigator initialRouteName="ProductList">
      <Stack.Screen name="ProductList" component={ProductList} />
      <Stack.Screen name="AddProduct" component={AddProduct} />
      <Stack.Screen name="BarCode" component={BarCode} />
      <Stack.Screen name="PushNotifications" component={PushNotifications} />
      <Stack.Screen name="StoreLocator" component={StoreLocator} />
      <Stack.Screen name="ProductDetail" component={ProductDetail} />
      <Stack.Screen name="Receipt" component={Receipt} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      
    </Stack.Navigator>
    
  </NavigationContainer>
);
  
}