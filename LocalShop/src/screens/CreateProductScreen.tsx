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
import { ProductFormData, Shop } from '../types';
import { ImageEditor } from '../components/ImageEditor';
import { OptimizedImage } from '../components/OptimizedImage';

const PRODUCT_CATEGORIES = [
  'Food',
  'Beverages',
  'Bakery',
  'Dairy',
  'Meat',
  'Produce',
  'Pantry',
  'Frozen',
  'Organic',
  'Specialty',
  'Other',
];

const DIETARY_OPTIONS = [
  'Gluten-Free',
  'Vegan',
  'Vegetarian',
  'Organic',
  'Halal',
  'Kosher',
  'Dairy-Free',
  'Nut-Free',
];

export const CreateProductScreen: React.FC = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    subcategory: '',
    shop: '',
    images: [], // Add this field
    inventory: {
      quantity: 0,
      unit: 'pieces',
      lowStockThreshold: 5,
      isUnlimited: false,
    },
    isAvailable: true,
    isFeatured: false,
    tags: [],
    dietary: {
      isGlutenFree: false,
      isVegan: false,
      isVegetarian: false,
      isOrganic: false,
      isHalal: false,
      isKosher: false,
      isDairyFree: false,
      isNutFree: false,
    },
    allergens: [],
    origin: {
      country: '',
      region: '',
      isLocal: true,
    },
  });

  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [imageEditorVisible, setImageEditorVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    loadUserShops();
  }, []);

  const loadUserShops = async () => {
    try {
      const userShops = await apiService.getUserShops();
      setShops(userShops);
      if (userShops.length > 0) {
        setFormData(prev => ({ ...prev, shop: userShops[0]._id || '' }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load your shops');
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateInventory = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [field]: value,
      },
    }));
  };

  const updateDietary = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietary: {
        ...prev.dietary,
        [field]: value,
      },
    }));
  };

  const updateOrigin = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      origin: {
        ...prev.origin,
        [field]: value,
      },
    }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergen)) {
        return prev.filter(a => a !== allergen);
      } else {
        return [...prev, allergen];
      }
    });
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImage = async (imageUri: string) => {
    setUploadingImages(true);
    try {
      const uploadedImage = await apiService.uploadImage(imageUri, 'image');
      
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), {
          url: uploadedImage.url,
          caption: '',
          isPrimary: prev.images?.length === 0, // First image is primary
          altText: formData.name || 'Product image'
        }]
      }));
      
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.map((img, i) => ({
        ...img,
        isPrimary: i === index
      })) || []
    }));
  };

  const editImage = (imageUri: string) => {
    setEditingImage(imageUri);
    setImageEditorVisible(true);
  };

  const handleImageEditSave = (editedImageUri: string) => {
    // Replace the original image with the edited one
    if (editingImage) {
      setFormData(prev => ({
        ...prev,
        images: prev.images?.map(img => 
          img.url === editingImage ? { ...img, url: editedImageUri } : img
        ) || []
      }));
    }
    setImageEditorVisible(false);
    setEditingImage(null);
  };

  const handleImageEditCancel = () => {
    setImageEditorVisible(false);
    setEditingImage(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Error', 'Please select a category');
      return false;
    }
    if (!formData.shop) {
      Alert.alert('Error', 'Please select a shop');
      return false;
    }
    if (formData.price <= 0) {
      Alert.alert('Error', 'Price must be greater than 0');
      return false;
    }
    if (!formData.inventory.isUnlimited && formData.inventory.quantity < 0) {
      Alert.alert('Error', 'Quantity cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const productData = {
        ...formData,
        tags: selectedTags,
        allergens: selectedAllergens,
      };

      await apiService.createProduct(productData);
      Alert.alert('Success', 'Product created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  if (shops.length === 0) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏪</Text>
          <Text style={styles.emptyTitle}>No shops available</Text>
          <Text style={styles.emptySubtitle}>You need to create a shop first before adding products.</Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.navigate('CreateShop' as never)}
          >
            <Text style={styles.emptyButtonText}>Create Your First Shop</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

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
            <Text style={styles.headerTitle}>Add New Product</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.content}>
            {/* Product Images */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Product Images</Text>
              
              <View style={styles.imageUploadContainer}>
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={pickImage}
                  disabled={uploadingImages}
                >
                  <Text style={styles.imageUploadButtonText}>📷 Choose from Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.imageUploadButton}
                  onPress={takePhoto}
                  disabled={uploadingImages}
                >
                  <Text style={styles.imageUploadButtonText}>🤳 Take Photo</Text>
                </TouchableOpacity>
              </View>

              {uploadingImages && (
                <View style={styles.uploadingContainer}>
                  <Text style={styles.uploadingText}>Uploading image...</Text>
                </View>
              )}

              {/* Display uploaded images */}
              {formData.images && formData.images.length > 0 && (
                <View style={styles.imagesContainer}>
                  <Text style={styles.label}>Uploaded Images ({formData.images.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {formData.images.map((image, index) => (
                      <View key={`image-${index}-${image.url}`} style={styles.imageContainer}>
                        <OptimizedImage 
                          source={{ uri: image.url }} 
                          style={styles.productImage}
                          placeholder="🍅"
                          fallback="❌"
                        />
                        <View style={styles.imageActions}>
                          <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => editImage(image.url)}
                          >
                            <Text style={styles.editButtonText}>✏️ Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.primaryButton,
                              image.isPrimary && styles.primaryButtonActive
                            ]}
                            onPress={() => setPrimaryImage(index)}
                          >
                            <Text style={styles.primaryButtonText}>
                              {image.isPrimary ? 'Primary' : 'Set Primary'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => removeImage(index)}
                          >
                            <Text style={styles.removeButtonText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <Text style={styles.helpText}>
                Add high-quality images of your product. The first image will be the primary image.
              </Text>
            </View>

            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Product Name *"
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
                {PRODUCT_CATEGORIES.map((category) => (
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

              <TextInput
                style={styles.input}
                placeholder="Subcategory (optional)"
                placeholderTextColor="#999"
                value={formData.subcategory}
                onChangeText={(text) => updateFormData('subcategory', text)}
              />
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Price *"
                placeholderTextColor="#999"
                value={formData.price.toString()}
                onChangeText={(text) => updateFormData('price', parseFloat(text) || 0)}
                keyboardType="numeric"
              />

              <TextInput
                style={styles.input}
                placeholder="Original Price (optional)"
                placeholderTextColor="#999"
                value={formData.originalPrice?.toString() || ''}
                onChangeText={(text) => updateFormData('originalPrice', parseFloat(text) || 0)}
                keyboardType="numeric"
              />
            </View>

            {/* Shop Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shop</Text>
              
              <Text style={styles.label}>Select Shop *</Text>
              <View style={styles.shopContainer}>
                {shops.map((shop) => (
                  <TouchableOpacity
                    key={shop._id}
                    style={[
                      styles.shopButton,
                      formData.shop === shop._id && styles.shopButtonActive,
                    ]}
                    onPress={() => updateFormData('shop', shop._id)}
                  >
                    <Text
                      style={[
                        styles.shopButtonText,
                        formData.shop === shop._id && styles.shopButtonTextActive,
                      ]}
                    >
                      {shop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Inventory */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inventory</Text>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Unlimited Stock</Text>
                <Switch
                  value={formData.inventory.isUnlimited}
                  onValueChange={(value) => updateInventory('isUnlimited', value)}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={formData.inventory.isUnlimited ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>

              {!formData.inventory.isUnlimited && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Quantity *"
                    placeholderTextColor="#999"
                    value={formData.inventory.quantity.toString()}
                    onChangeText={(text) => updateInventory('quantity', parseInt(text) || 0)}
                    keyboardType="numeric"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Unit (pieces, kg, etc.)"
                    placeholderTextColor="#999"
                    value={formData.inventory.unit}
                    onChangeText={(text) => updateInventory('unit', text)}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Low Stock Threshold"
                    placeholderTextColor="#999"
                    value={formData.inventory.lowStockThreshold.toString()}
                    onChangeText={(text) => updateInventory('lowStockThreshold', parseInt(text) || 0)}
                    keyboardType="numeric"
                  />
                </>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Available for Purchase</Text>
                <Switch
                  value={formData.isAvailable}
                  onValueChange={(value) => updateFormData('isAvailable', value)}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={formData.isAvailable ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Featured Product</Text>
                <Switch
                  value={formData.isFeatured}
                  onValueChange={(value) => updateFormData('isFeatured', value)}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={formData.isFeatured ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Dietary Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dietary Information</Text>
              
              <View style={styles.dietaryContainer}>
                {DIETARY_OPTIONS.map((option) => {
                  const key = `is${option.replace('-', '')}` as keyof typeof formData.dietary;
                  return (
                    <View key={option} style={styles.switchRow}>
                      <Text style={styles.switchLabel}>{option}</Text>
                      <Switch
                        value={formData.dietary[key]}
                        onValueChange={(value) => updateDietary(key, value)}
                        trackColor={{ false: '#767577', true: '#667eea' }}
                        thumbColor={formData.dietary[key] ? '#f4f3f4' : '#f4f3f4'}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Origin */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Origin</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Country (optional)"
                placeholderTextColor="#999"
                value={formData.origin?.country}
                onChangeText={(text) => updateOrigin('country', text)}
              />

              <TextInput
                style={styles.input}
                placeholder="Region (optional)"
                placeholderTextColor="#999"
                value={formData.origin?.region}
                onChangeText={(text) => updateOrigin('region', text)}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Local Product</Text>
                <Switch
                  value={formData.origin?.isLocal}
                  onValueChange={(value) => updateOrigin('isLocal', value)}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={formData.origin?.isLocal ? '#f4f3f4' : '#f4f3f4'}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Product...' : 'Create Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Image Editor Modal */}
        {editingImage && (
          <ImageEditor
            visible={imageEditorVisible}
            imageUri={editingImage}
            onSave={handleImageEditSave}
            onCancel={handleImageEditCancel}
          />
        )}
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
    marginBottom: 15,
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
  shopContainer: {
    gap: 10,
  },
  shopButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 15,
  },
  shopButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  shopButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  shopButtonTextActive: {
    color: 'white',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  dietaryContainer: {
    gap: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  emptyButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
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
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 5,
  },
  editButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editButtonText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  primaryButtonActive: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#D32F2F',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
}); 