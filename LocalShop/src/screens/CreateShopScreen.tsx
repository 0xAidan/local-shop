import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import MapView, { Marker } from 'react-native-maps';
import { apiService } from '../services/api';
import { ShopFormData } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';
import { RoleSwitcher } from '../components/RoleSwitcher';

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
  const [mapRegion, setMapRegion] = useState({
    latitude: 43.6532, // Toronto coordinates as default
    longitude: -79.3832,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isGeocoding, setIsGeocoding] = useState(false);

  const navigation = useNavigation();

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
      return;
    }

    setIsGeocoding(true);
    try {
      const fullAddress = `${formData.location.address}, ${formData.location.city}, ${formData.location.province}, ${formData.location.postalCode}`;
      const coordinates = await apiService.geocodeAddress(fullAddress);
      
      if (coordinates) {
        setMapRegion({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.log('Geocoding failed:', error);
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
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>Create Your Shop</Text>
            <Text style={styles.subtitle}>Set up your business profile</Text>

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
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.location.province}
                  onValueChange={(value) => updateLocation('province', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Province" value="" />
                  {CANADIAN_PROVINCES.map((province) => (
                    <Picker.Item key={province.code} label={province.name} value={province.code} />
                  ))}
                </Picker>
              </View>

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
                <MapView
                  style={styles.map}
                  region={mapRegion}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                >
                  <Marker
                    coordinate={{
                      latitude: mapRegion.latitude,
                      longitude: mapRegion.longitude,
                    }}
                    title={formData.name || 'Shop Location'}
                    description={formData.location.address}
                  />
                </MapView>
                {isGeocoding && (
                  <View style={styles.geocodingOverlay}>
                    <Text style={styles.geocodingText}>Updating location...</Text>
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
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Shop...' : 'Create Shop'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
}); 