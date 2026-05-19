import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../utils/responsive';

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
  { id: 'all', name: 'All', iconType: 'Ionicons', iconName: 'storefront', color: colors.primary },
  { id: 'farmers-market', name: 'Farmers Market', iconType: 'MaterialCommunityIcons', iconName: 'carrot', color: '#7EC8A3' },
  { id: 'bakery', name: 'Bakery', iconType: 'MaterialCommunityIcons', iconName: 'baguette', color: '#E8B86D' },
  { id: 'coffee', name: 'Coffee', iconType: 'Ionicons', iconName: 'cafe', color: '#C4A484' },
  { id: 'specialty-food', name: 'Specialty', iconType: 'Ionicons', iconName: 'nutrition', color: '#B88FD4' },
];

const renderIcon = (category: Category, size: number, color: string) => {
  switch (category.iconType) {
    case 'Ionicons':
      return <Ionicons name={category.iconName as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
    case 'MaterialIcons':
      return <MaterialIcons name={category.iconName as keyof typeof MaterialIcons.glyphMap} size={size} color={color} />;
    case 'MaterialCommunityIcons':
      return (
        <MaterialCommunityIcons
          name={category.iconName as keyof typeof MaterialCommunityIcons.glyphMap}
          size={size}
          color={color}
        />
      );
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
      >
        {categories.map((category) => {
          const isSelected =
            category.id === 'all' ? selectedCategory === null : selectedCategory === category.id;

          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onCategorySelect(category.id === 'all' ? null : category.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.iconWrap, isSelected && { backgroundColor: `${category.color}33` }]}>
                {renderIcon(category, 18, isSelected ? category.color : colors.textSecondary)}
              </View>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]} numberOfLines={1}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 180,
  },
  chipSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
