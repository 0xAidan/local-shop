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

const { width: screenWidth } = Dimensions.get('window');

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All', icon: '🏪', color: '#4A90E2' },
  { id: 'farmers-market', name: 'Farmers Market', icon: '🥬', color: '#2ECC71' },
  { id: 'bakery', name: 'Bakery', icon: '🥖', color: '#F39C12' },
  { id: 'specialty-food', name: 'Specialty Food', icon: '🧀', color: '#E74C3C' },
  { id: 'coffee', name: 'Coffee', icon: '☕', color: '#8B4513' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', color: '#87CEEB' },
  { id: 'meat', name: 'Meat', icon: '🥩', color: '#DC143C' },
  { id: 'organic', name: 'Organic', icon: '🌱', color: '#228B22' },
];

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
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryNameSelected}>{category.name}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.categoryButtonInactive}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
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
    fontSize: 24,
    marginBottom: 4,
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