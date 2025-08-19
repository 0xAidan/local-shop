import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: SearchFilters) => void;
  placeholder?: string;
}

export interface SearchFilters {
  category?: string;
  rating?: number;
  distance?: number;
  features?: string[];
}

const categories = [
  'All Categories',
  'Farmers Market',
  'Bakery',
  'Specialty Food',
  'Grocery',
  'Restaurant',
  'Butcher',
  'Fish Market',
  'Convenience Store',
  'Beverages',
];

const features = [
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

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search shops...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'All Categories') count++;
    if (filters.rating) count++;
    if (filters.distance) count++;
    if (filters.features && filters.features.length > 0) count += filters.features.length;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>🔍</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#000000', '#1a1a1a']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Category Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Category</Text>
                  <View style={styles.categoryGrid}>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          filters.category === category && styles.categoryButtonActive,
                        ]}
                        onPress={() => handleFilterChange({ category })}
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            filters.category === category && styles.categoryButtonTextActive,
                          ]}
                        >
                          {category}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Rating Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingButton,
                          filters.rating === rating && styles.ratingButtonActive,
                        ]}
                        onPress={() => handleFilterChange({ rating })}
                      >
                        <Text style={styles.ratingButtonText}>
                          {rating}+ ⭐
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Features Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Features</Text>
                  <View style={styles.featuresGrid}>
                    {features.map((feature) => (
                      <TouchableOpacity
                        key={feature}
                        style={[
                          styles.featureButton,
                          filters.features?.includes(feature) && styles.featureButtonActive,
                        ]}
                        onPress={() => {
                          const currentFeatures = filters.features || [];
                          const newFeatures = currentFeatures.includes(feature)
                            ? currentFeatures.filter(f => f !== feature)
                            : [...currentFeatures, feature];
                          handleFilterChange({ features: newFeatures });
                        }}
                      >
                        <Text
                          style={[
                            styles.featureButtonText,
                            filters.features?.includes(feature) && styles.featureButtonTextActive,
                          ]}
                        >
                          {feature}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilters(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#667eea',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 30,
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  ratingButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  ratingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  featureButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  featureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  featureButtonTextActive: {
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  applyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 