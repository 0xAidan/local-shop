import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { LinearGradient } from 'expo-linear-gradient';

interface ImageEditorProps {
  visible: boolean;
  imageUri: string;
  onSave: (editedImageUri: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  visible,
  imageUri,
  onSave,
  onCancel,
}) => {
  const [currentImage, setCurrentImage] = useState(imageUri);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyFilter = async (filter: 'none' | 'grayscale' | 'sepia' | 'vintage' | 'brightness' | 'contrast') => {
    setIsProcessing(true);
    try {
      let actions: ImageManipulator.Action[] = [];

      switch (filter) {
        case 'grayscale':
          actions = [{ grayscale: 1 }];
          break;
        case 'sepia':
          actions = [{ sepia: 0.8 }];
          break;
        case 'vintage':
          actions = [
            { sepia: 0.6 },
            { brightness: 0.1 },
            { contrast: 1.2 }
          ];
          break;
        case 'brightness':
          actions = [{ brightness: 0.2 }];
          break;
        case 'contrast':
          actions = [{ contrast: 1.3 }];
          break;
        default:
          // Reset to original
          setCurrentImage(imageUri);
          setIsProcessing(false);
          return;
      }

      const result = await ImageManipulator.manipulateAsync(
        currentImage,
        actions,
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentImage(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply filter');
    } finally {
      setIsProcessing(false);
    }
  };

  const cropImage = async () => {
    setIsProcessing(true);
    try {
      // Crop to square aspect ratio
      const result = await ImageManipulator.manipulateAsync(
        currentImage,
        [{ crop: { originX: 0, originY: 0, width: 800, height: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentImage(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to crop image');
    } finally {
      setIsProcessing(false);
    }
  };

  const resizeImage = async () => {
    setIsProcessing(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        currentImage,
        [{ resize: { width: 800, height: 600 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCurrentImage(result.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to resize image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onSave(currentImage);
  };

  const handleReset = () => {
    setCurrentImage(imageUri);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onCancel}>
            <Text style={styles.headerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Image</Text>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Text style={styles.headerButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImage }} style={styles.previewImage} resizeMode="contain" />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <ScrollView style={styles.controls} showsVerticalScrollIndicator={false}>
          {/* Basic Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Actions</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={cropImage}
                disabled={isProcessing}
              >
                <Text style={styles.actionButtonText}>✂️ Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={resizeImage}
                disabled={isProcessing}
              >
                <Text style={styles.actionButtonText}>📏 Resize</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleReset}
                disabled={isProcessing}
              >
                <Text style={styles.actionButtonText}>🔄 Reset</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filters</Text>
            <View style={styles.filterGrid}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('none')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>Original</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('grayscale')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>B&W</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('sepia')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>Sepia</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('vintage')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>Vintage</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('brightness')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>Bright</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => applyFilter('contrast')}
                disabled={isProcessing}
              >
                <Text style={styles.filterButtonText}>Contrast</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Tips</Text>
            <Text style={styles.tipsText}>
              • Use filters to enhance your product photos{'\n'}
              • Crop to focus on the main subject{'\n'}
              • Resize for optimal loading speed{'\n'}
              • High-quality images attract more customers
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    maxHeight: 300,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tipsText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
}); 