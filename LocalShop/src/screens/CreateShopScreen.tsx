import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Image,
  Dimensions,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { apiService } from '../services/api';
import { ShopFormData } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';
import { ScreenHeader } from '../components/ScreenHeader';
import { ResponsiveButton } from '../components/ResponsiveButton';

const { width: screenWidth } = Dimensions.get('window');

const SHOP_CATEGORIES = [
  'Grocery',
  'Restaurant',
  'Bakery',
  'Butcher',
  'Fish Market',
  'Farmers Market',
  'Convenience Store',
  'Specialty Food',
  'Beverages',
  'Other',
];

const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const SHOP_FEATURES = [
  'Delivery',
  'Pickup',
  'Curbside',
  'Organic',
  'Local',
  'Gluten-Free',
  'Vegan',
  'Halal',
  'Kosher',
  'Wheelchair Accessible',
  'Parking Available',
];

export const CreateShopScreen: React.FC = () => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    description: '',
    category: '',
    logo: undefined,
    location: {
      address: '',
      city: '',
      province: '',
      postalCode: '',
    },
    contact: {
      phone: '',
      email: '',
      website: '',
    },
    hours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
    tags: [],
    features: [],
  });

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHours, setShowHours] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [shopImages, setShopImages] = useState<Array<{
    url: string;
    caption?: string;
    isPrimary?: boolean;
  }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [mapRegion, setMapRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLocation = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  const updateContact = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value,
      },
    }));
  };

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours?.[day as keyof typeof prev.hours],
          [field]: value,
        },
      },
    }));
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const selectProvince = (provinceCode: string) => {
    updateLocation('province', provinceCode);
    setShowProvinceModal(false);
  };

  const getProvinceName = (code: string) => {
    const province = CANADIAN_PROVINCES.find(p => p.code === code);
    return province ? province.name : 'Select Province';
  };

  const uploadShopLogo = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to server
        const uploadedImage = await apiService.uploadImage(imageUri, 'shop-logos');
        
        setFormData(prev => ({
          ...prev,
          logo: {
            url: uploadedImage.url,
            publicId: uploadedImage.publicId,
          },
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload logo');
    }
  };

  const uploadShopImage = async () => {
    try {
      setUploadingImages(true);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to server
        const uploadedImage = await apiService.uploadImage(imageUri, 'shop-images');
        
        setShopImages(prev => [
          ...prev,
          {
            url: uploadedImage.url,
            caption: '',
            isPrimary: prev.length === 0, // First image is primary
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  };

  const geocodeAddress = async () => {
    if (!formData.location.address || !formData.location.city || !formData.location.province) {
      console.log('📍 Geocoding skipped: Missing required fields', {
        address: formData.location.address,
        city: formData.location.city,
        province: formData.location.province
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${formData.location.address}, ${formData.location.city}, ${formData.location.province}, ${formData.location.postalCode}`;
      console.log('📍 Attempting to geocode address:', fullAddress);
      console.log('📍 Current mapRegion before geocoding:', mapRegion);
      console.log('📍 Current geocodedCoordinates before geocoding:', geocodedCoordinates);
      
      const coordinates = await apiService.geocodeAddress(fullAddress);
      
      console.log('📍 Raw coordinates response:', coordinates);
      
      if (coordinates) {
        console.log('✅ Geocoding successful:', coordinates);
        console.log('📍 Setting new coordinates:', coordinates);
        
        setGeocodedCoordinates(coordinates);
        
        const newMapRegion = {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        console.log('📍 Setting new mapRegion:', newMapRegion);
        setMapRegion(newMapRegion);
        
        // Force map to animate to new region
        if (mapRef.current) {
          console.log('🗺️ Animating map to new region');
          mapRef.current.animateToRegion(newMapRegion, 1000);
        }
        
        console.log('📍 State updates scheduled');
      } else {
        console.log('❌ Geocoding returned null coordinates');
        setGeocodedCoordinates(null);
        setMapRegion(null);
      }
    } catch (error) {
      console.error('❌ Geocoding failed with error:', error);
      setGeocodedCoordinates(null);
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (formData.location.address && formData.location.city && formData.location.province) {
      const timeoutId = setTimeout(geocodeAddress, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.location.address, formData.location.city, formData.location.province, formData.location.postalCode]);

  // Debug useEffect for map state changes
  useEffect(() => {
    console.log('🗺️ Map state changed - region:', mapRegion);
    console.log('🗺️ Map state changed - geocodedCoordinates:', geocodedCoordinates);
  }, [mapRegion, geocodedCoordinates]);

  // Animate map when coordinates change
  useEffect(() => {
    if (geocodedCoordinates && mapRegion && mapRef.current) {
      console.log('🗺️ Animating map to new coordinates:', geocodedCoordinates);
      mapRef.current.animateToRegion(mapRegion, 1000);
    }
  }, [geocodedCoordinates, mapRegion]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Shop name is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.location.address.trim()) {
      Alert.alert('Error', 'Address is required');
      return false;
    }
    if (!formData.location.city.trim()) {
      Alert.alert('Error', 'City is required');
      return false;
    }
    if (!formData.location.province) {
      Alert.alert('Error', 'Province is required');
      return false;
    }
    if (!formData.location.postalCode.trim()) {
      Alert.alert('Error', 'Postal code is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const shopData = {
        ...formData,
        features: selectedFeatures,
        images: shopImages,
      };

      await apiService.createShop(shopData);
      Alert.alert('Success', 'Shop created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create shop');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <ScreenHeader 
          title="Create Shop" 
          subtitle="Set up your business profile"
        />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.label}>Shop Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter shop name"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Category *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Category" value="" />
                  {SHOP_CATEGORIES.map((category) => (
                    <Picker.Item key={category} label={category} value={category} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                placeholder="Describe your shop..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Shop Logo */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop Logo</Text>
              <TouchableOpacity style={styles.logoUpload} onPress={uploadShopLogo}>
                {formData.logo ? (
                  <Image source={{ uri: formData.logo.url }} style={styles.logoPreview} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.logoPlaceholderText}>Upload Logo</Text>
                    <Text style={styles.logoPlaceholderSubtext}>Tap to add your shop logo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.location.address}
                onChangeText={(text) => updateLocation('address', text)}
                placeholder="Street address"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.location.city}
                onChangeText={(text) => updateLocation('city', text)}
                placeholder="City"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Province *</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowProvinceModal(true)}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !formData.location.province && styles.dropdownButtonTextPlaceholder
                ]}>
                  {getProvinceName(formData.location.province)}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Postal Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.location.postalCode}
                onChangeText={(text) => updateLocation('postalCode', text.toUpperCase())}
                placeholder="A1A 1A1"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={7}
              />

              {/* Map Preview */}
              <Text style={styles.label}>Location Preview</Text>
              <View style={styles.mapContainer}>
                {mapRegion && geocodedCoordinates ? (
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    region={mapRegion}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    onMapReady={() => {
                      if (geocodedCoordinates) {
                        console.log('🗺️ Map ready, animating to coordinates:', geocodedCoordinates);
                      }
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: geocodedCoordinates.latitude,
                        longitude: geocodedCoordinates.longitude,
                      }}
                      title={formData.name || 'Shop Location'}
                      description={formData.location.address}
                      pinColor="#4A90E2"
                    />
                  </MapView>
                ) : (
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapPlaceholderText}>
                      {isGeocoding 
                        ? 'Updating location...' 
                        : formData.location.address && formData.location.city && formData.location.province
                        ? 'Loading location preview...'
                        : 'Enter address details to see location preview'
                      }
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.contact?.phone}
                onChangeText={(text) => updateContact('phone', text)}
                placeholder="(555) 123-4567"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.contact?.email}
                onChangeText={(text) => updateContact('email', text)}
                placeholder="shop@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.contact?.website}
                onChangeText={(text) => updateContact('website', text)}
                placeholder="https://www.example.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            {/* Features */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setShowFeatures(!showFeatures)}
              >
                <Text style={styles.sectionTitle}>Features</Text>
                <Text style={styles.toggleText}>{showFeatures ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
              
              {showFeatures && (
                <View style={styles.featuresGrid}>
                  {SHOP_FEATURES.map((feature) => (
                    <TouchableOpacity
                      key={feature}
                      style={[
                        styles.featureButton,
                        selectedFeatures.includes(feature) && styles.featureButtonActive,
                      ]}
                      onPress={() => toggleFeature(feature)}
                    >
                      <Text
                        style={[
                          styles.featureButtonText,
                          selectedFeatures.includes(feature) && styles.featureButtonTextActive,
                        ]}
                      >
                        {feature}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Submit Button */}
            <ResponsiveButton
              title={isLoading ? 'Creating Shop...' : 'Create Shop'}
              onPress={handleSubmit}
              disabled={isLoading}
              variant="primary"
              size="large"
              fullWidth
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
        </KeyboardAvoidingView>

        {/* Province Selection Modal */}
        <Modal
          visible={showProvinceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowProvinceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Province</Text>
                <TouchableOpacity
                  onPress={() => setShowProvinceModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={CANADIAN_PROVINCES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.provinceItem}
                    onPress={() => selectProvince(item.code)}
                  >
                    <Text style={styles.provinceItemText}>{item.name}</Text>
                    {formData.location.province === item.code && (
                      <Text style={styles.provinceItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
                style={styles.provinceList}
              />
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dropdownButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButtonTextPlaceholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  logoUpload: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  logoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logoPlaceholderSubtext: {
    fontSize: 12,
    color: '#E0E0E0',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
  },
  mapPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  geocodingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  geocodingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  featureButtonTextActive: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#666',
  },
  provinceList: {
    maxHeight: 400,
  },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  provinceItemText: {
    fontSize: 16,
    color: '#333',
  },
  provinceItemCheck: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
}); 