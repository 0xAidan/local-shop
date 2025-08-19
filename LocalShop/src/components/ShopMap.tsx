import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Shop } from '../types';

interface ShopMapProps {
  shops: Shop[];
  onShopPress?: (shop: Shop) => void;
  style?: any;
}

export const ShopMap: React.FC<ShopMapProps> = ({ 
  shops, 
  onShopPress,
  style 
}) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 48.3809, // Thunder Bay default
    longitude: -89.2477,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to see shops near you.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Update region to user's location
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Keep default Thunder Bay location
    }
  };

  const handleShopPress = (shop: Shop) => {
    if (onShopPress) {
      onShopPress(shop);
    }
  };

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'Farmers Market':
        return '#4CAF50'; // Green
      case 'Bakery':
        return '#FF9800'; // Orange
      case 'Specialty Food':
        return '#2196F3'; // Blue
      default:
        return '#9C27B0'; // Purple
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.coords.latitude,
              longitude: userLocation.coords.longitude,
            }}
            title="You are here"
            description="Your current location"
            pinColor="#FF0000"
          />
        )}

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop.id}
            coordinate={{
              latitude: shop.location.coordinates.latitude,
              longitude: shop.location.coordinates.longitude,
            }}
            title={shop.name}
            description={shop.description}
            pinColor={getMarkerColor(shop.category)}
            onPress={() => handleShopPress(shop)}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{shop.name}</Text>
                <Text style={styles.calloutCategory}>{shop.category}</Text>
                <Text style={styles.calloutRating}>
                  ⭐ {shop.rating.average} ({shop.rating.count} reviews)
                </Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={() => handleShopPress(shop)}
                >
                  <Text style={styles.calloutButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Map controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={getUserLocation}
        >
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 20,
  },
  callout: {
    width: 200,
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutRating: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 