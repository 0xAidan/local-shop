import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Shop } from '../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MapPreviewProps {
  shop: Shop;
  height?: number;
}

export const MapPreview: React.FC<MapPreviewProps> = ({ 
  shop, 
  height = 120 
}) => {
  const [mapVisible, setMapVisible] = useState(false);

  const region = {
    latitude: shop.location.coordinates.latitude,
    longitude: shop.location.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'Farmers Market':
        return '#4CAF50';
      case 'Bakery':
        return '#FF9800';
      case 'Specialty Food':
        return '#2196F3';
      default:
        return '#9C27B0';
    }
  };

  return (
    <>
      {/* Map Preview */}
      <TouchableOpacity
        style={[styles.previewContainer, { height }]}
        onPress={() => setMapVisible(true)}
        activeOpacity={0.9}
      >
        <MapView
          style={styles.previewMap}
          region={region}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: shop.location.coordinates.latitude,
              longitude: shop.location.coordinates.longitude,
            }}
            title={shop.name}
            pinColor={getMarkerColor(shop.category)}
          />
        </MapView>
        
        {/* Overlay with shop info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.previewOverlay}
        >
          <View style={styles.previewInfo}>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color="#FFFFFF" />
              <Text style={styles.locationText} numberOfLines={1}>
                {shop.location.address}
              </Text>
            </View>
            <View style={styles.expandButton}>
              <Ionicons name="expand" size={16} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Full Map Modal */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#000000']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setMapVisible(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{shop.name}</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Full Map */}
            <View style={styles.fullMapContainer}>
              <MapView
                style={styles.fullMap}
                region={region}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
              >
                <Marker
                  coordinate={{
                    latitude: shop.location.coordinates.latitude,
                    longitude: shop.location.coordinates.longitude,
                  }}
                  title={shop.name}
                  description={shop.location.address}
                  pinColor={getMarkerColor(shop.category)}
                />
              </MapView>
            </View>

            {/* Shop Info Card */}
            <View style={styles.shopInfoCard}>
              <View style={styles.shopInfoHeader}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopCategory}>{shop.category}</Text>
              </View>
              
              <View style={styles.addressInfo}>
                <Ionicons name="location" size={16} color="#4A90E2" />
                <Text style={styles.addressText}>{shop.location.address}</Text>
              </View>
              
              <View style={styles.cityInfo}>
                <Text style={styles.cityText}>
                  {shop.location.city}, {shop.location.state} {shop.location.zipCode}
                </Text>
              </View>

              {shop.distance && (
                <View style={styles.distanceInfo}>
                  <Ionicons name="navigate" size={16} color="#4A90E2" />
                  <Text style={styles.distanceText}>{shop.distance} away</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    position: 'relative',
  },
  previewMap: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  previewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  expandButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  fullMapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  shopInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shopInfoHeader: {
    marginBottom: 12,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  shopCategory: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  cityInfo: {
    marginBottom: 8,
  },
  cityText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 24,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 