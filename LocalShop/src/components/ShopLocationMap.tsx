import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Shop } from '../types';

interface ShopLocationMapProps {
  shop: Shop;
  visible: boolean;
  onClose: () => void;
}

export const ShopLocationMap: React.FC<ShopLocationMapProps> = ({ 
  shop, 
  visible, 
  onClose 
}) => {
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: shop.location.coordinates.latitude,
    longitude: shop.location.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (visible) {
      getUserLocation();
    }
  }, [visible]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'Please enable location access to see directions to this shop.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Center map to show both user and shop location
      const midLat = (location.coords.latitude + shop.location.coordinates.latitude) / 2;
      const midLng = (location.coords.longitude + shop.location.coordinates.longitude) / 2;
      const latDelta = Math.abs(location.coords.latitude - shop.location.coordinates.latitude) * 1.5;
      const lngDelta = Math.abs(location.coords.longitude - shop.location.coordinates.longitude) * 1.5;
      
      setRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Keep shop location as center
    }
  };

  const openDirections = () => {
    const { latitude, longitude } = shop.location.coordinates;
    const url = `https://maps.google.com/maps?daddr=${latitude},${longitude}`;
    
    // You can use Linking.openURL(url) here if you want to open in external maps app
    Alert.alert(
      'Directions',
      `Open directions to ${shop.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Maps', onPress: () => console.log('Open maps:', url) }
      ]
    );
  };

  const getDirections = () => {
    if (!userLocation) {
      Alert.alert('Location Required', 'Please enable location access to get directions.');
      return;
    }

    const { latitude: shopLat, longitude: shopLng } = shop.location.coordinates;
    const { latitude: userLat, longitude: userLng } = userLocation.coords;
    
    // Calculate distance (simple formula - you might want to use a more accurate one)
    const distance = Math.sqrt(
      Math.pow(shopLat - userLat, 2) + Math.pow(shopLng - userLng, 2)
    ) * 111; // Rough conversion to km
    
    Alert.alert(
      'Distance',
      `You are approximately ${distance.toFixed(1)} km from ${shop.name}`,
      [
        { text: 'OK' },
        { text: 'Get Directions', onPress: openDirections }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <MapView
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* Shop marker */}
          <Marker
            coordinate={{
              latitude: shop.location.coordinates.latitude,
              longitude: shop.location.coordinates.longitude,
            }}
            title={shop.name}
            description={shop.description || 'Local shop'}
            pinColor="#667eea"
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{shop.name}</Text>
                <Text style={styles.calloutCategory}>{shop.category}</Text>
                <Text style={styles.calloutAddress}>{shop.location.address}</Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={getDirections}
                >
                  <Text style={styles.calloutButtonText}>Get Directions</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        </MapView>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{shop.name}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={getUserLocation}
          >
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={getDirections}
          >
            <Text style={styles.controlButtonText}>🧭</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopAddress}>{shop.location.address}</Text>
          <Text style={styles.shopCity}>
            {shop.location.city}, {shop.location.state} {shop.location.zipCode}
          </Text>
          {shop.contact?.phone && (
            <Text style={styles.shopPhone}>📞 {shop.contact.phone}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  headerSpacer: {
    width: 40,
  },
  controls: {
    position: 'absolute',
    top: 120,
    right: 20,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
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
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  shopAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  shopCity: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  shopPhone: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
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
  calloutAddress: {
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