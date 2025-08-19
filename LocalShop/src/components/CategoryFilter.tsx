import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export interface Category {
  id: string;
  name: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'MaterialCommunityIcons';
  iconName: string;
  color: string;
}

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All', iconType: 'Ionicons', iconName: 'storefront', color: '#4A90E2' },
  { id: 'farmers-market', name: 'Farmers Market', iconType: 'MaterialCommunityIcons', iconName: 'carrot', color: '#2ECC71' },
  { id: 'bakery', name: 'Bakery', iconType: 'MaterialCommunityIcons', iconName: 'baguette', color: '#F39C12' },
  { id: 'coffee', name: 'Coffee & Tea', iconType: 'Ionicons', iconName: 'cafe', color: '#8B4513' },
  { id: 'arts-crafts', name: 'Arts & Crafts', iconType: 'MaterialIcons', iconName: 'palette', color: '#9B59B6' },
  { id: 'clothing', name: 'Clothing', iconType: 'MaterialCommunityIcons', iconName: 'tshirt-crew', color: '#E91E63' },
  { id: 'jewelry', name: 'Jewelry', iconType: 'MaterialCommunityIcons', iconName: 'diamond-stone', color: '#FFD700' },
  { id: 'home-decor', name: 'Home & Decor', iconType: 'MaterialIcons', iconName: 'home', color: '#795548' },
  { id: 'services', name: 'Services', iconType: 'MaterialIcons', iconName: 'handyman', color: '#607D8B' },
];

const renderIcon = (category: Category, size: number = 20, color: string = '#FFFFFF') => {
  const { iconType, iconName } = category;
  
  switch (iconType) {
    case 'Ionicons':
      return <Ionicons name={iconName as any} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={iconName as any} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
    default:
      return <Ionicons name="storefront" size={size} color={color} />;
  }
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = defaultCategories,
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={100}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.id;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryContainer}
              onPress={() => onCategorySelect(category.id === 'all' ? null : category.id)}
              activeOpacity={0.8}
            >
              {isSelected ? (
                <LinearGradient
                  colors={[category.color, category.color + 'CC']}
                  style={styles.categoryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.categoryIcon}>
                    {renderIcon(category, 22, '#FFFFFF')}
                  </View>
                  <Text style={styles.categoryNameSelected}>{category.name}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryButtonInactive}>
                  <View style={styles.categoryIcon}>
                    {renderIcon(category, 22, 'rgba(255, 255, 255, 0.8)')}
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryContainer: {
    minWidth: 80,
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryButtonInactive: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryIcon: {
    marginBottom: 6,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categoryNameSelected: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});