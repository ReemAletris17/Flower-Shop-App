import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'

const stores = [
  {
    id: 1,
    name: 'Shop App - City Centre',
    latitude: 31.2058,
    longitude: 29.9245,
  },
  {
    id: 2,
    name: 'Shop App - Smouha',
    latitude: 31.2156,
    longitude: 29.9553,
  },
]

export default function StoreLocator() {
  const [userLocation, setUserLocation] = useState(null)

  useEffect(() => {
    getUserLocation()
  }, [])

  async function getUserLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location permission is required.')
      return
    }

    const location = await Location.getCurrentPositionAsync({})

    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    })
  }

  if (!userLocation) {
    return (
      <View style={styles.center}>
        <Text>Loading map...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description="Nearby store location"
          />
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})