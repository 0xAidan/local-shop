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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../services/api';
import { ShopFormData } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

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
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
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
    setSelectedFeatures(prev => {
      if (prev.includes(feature)) {
        return prev.filter(f => f !== feature);
      } else {
        return [...prev, feature];
      }
    });
  };

  const pickShopImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Better for shop banners
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadShopImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadShopImage = async (imageUri: string) => {
    setUploadingImages(true);
    try {
      const uploadedImage = await apiService.uploadImage(imageUri, 'image');
      
      setShopImages(prev => [...prev, {
        url: uploadedImage.url,
        caption: '',
        isPrimary: prev.length === 0, // First image is primary
      }]);
      
      Alert.alert('Success', 'Shop image uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

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
    if (!formData.location.state.trim()) {
      Alert.alert('Error', 'State is required');
      return false;
    }
    if (!formData.location.zipCode.trim()) {
      Alert.alert('Error', 'ZIP code is required');
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
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Shop</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Shop Name *"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
              />

              <TextInput
                style={styles.textArea}
                placeholder="Description (optional)"
                placeholderTextColor="#999"
                value={formData.description}
                onChangeText={(text) => updateFormData('description', text)}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryContainer}>
                {SHOP_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      formData.category === category && styles.categoryButtonActive,
                    ]}
                    onPress={() => updateFormData('category', category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.category === category && styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Street Address *"
                placeholderTextColor="#999"
                value={formData.location.address}
                onChangeText={(text) => updateLocation('address', text)}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="City *"
                  placeholderTextColor="#999"
                  value={formData.location.city}
                  onChangeText={(text) => updateLocation('city', text)}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="State *"
                  placeholderTextColor="#999"
                  value={formData.location.state}
                  onChangeText={(text) => updateLocation('state', text)}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="ZIP Code *"
                placeholderTextColor="#999"
                value={formData.location.zipCode}
                onChangeText={(text) => updateLocation('zipCode', text)}
                keyboardType="numeric"
              />
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                value={formData.contact?.phone}
                onChangeText={(text) => updateContact('phone', text)}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={formData.contact?.email}
                onChangeText={(text) => updateContact('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={styles.input}
                placeholder="Website"
                placeholderTextColor="#999"
                value={formData.contact?.website}
                onChangeText={(text) => updateContact('website', text)}
                autoCapitalize="none"
              />
            </View>

            {/* Business Hours */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Business Hours</Text>
                <Switch
                  value={showHours}
                  onValueChange={setShowHours}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={showHours ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>

              {showHours && (
                <View style={styles.hoursContainer}>
                  {Object.entries(formData.hours || {}).map(([day, hours]) => (
                    <View key={day} style={styles.hourRow}>
                      <Text style={styles.dayLabel}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                      <View style={styles.timeInputs}>
                        <TextInput
                          style={styles.timeInput}
                          placeholder="Open"
                          placeholderTextColor="#999"
                          value={hours?.open}
                          onChangeText={(text) => updateHours(day, 'open', text)}
                        />
                        <Text style={styles.timeSeparator}>-</Text>
                        <TextInput
                          style={styles.timeInput}
                          placeholder="Close"
                          placeholderTextColor="#999"
                          value={hours?.close}
                          onChangeText={(text) => updateHours(day, 'close', text)}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Features */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Features</Text>
                <Switch
                  value={showFeatures}
                  onValueChange={setShowFeatures}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={showFeatures ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>

              {showFeatures && (
                <View style={styles.featuresContainer}>
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

            {/* Shop Images */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop Images</Text>
              
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={pickShopImage}
                  disabled={uploadingImages}
                >
                  <Text style={styles.imageUploadButtonText}>📷 Add Shop Photos</Text>
                </TouchableOpacity>
              </View>

              {uploadingImages && (
                <View style={styles.uploadingContainer}>
                  <Text style={styles.uploadingText}>Uploading image...</Text>
                </View>
              )}

              {/* Display uploaded images */}
              {shopImages.length > 0 && (
                <View style={styles.imagesContainer}>
                  <Text style={styles.label}>Shop Images ({shopImages.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {shopImages.map((image, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <OptimizedImage 
                          source={{ uri: image.url }} 
                          style={styles.shopImage}
                          placeholder="🏪"
                          fallback="❌"
                        />
                        <Text style={styles.imageCaption}>
                          {image.isPrimary ? 'Primary Image' : `Image ${index + 1}`}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.helpText}>
                Add photos of your shop, products, or storefront to attract customers.
              </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  hoursContainer: {
    gap: 10,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    width: 80,
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  timeSeparator: {
    fontSize: 16,
    color: '#666',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  featureButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  featureButtonText: {
    color: '#666',
    fontSize: 14,
  },
  featureButtonTextActive: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageUploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageUploadButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  imageUploadButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  uploadingContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  uploadingText: {
    color: '#856404',
    fontWeight: '500',
  },
  imagesContainer: {
    marginBottom: 15,
  },
  imageContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  shopImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 