import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, layout } from '../theme/colors';

export interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const defaultCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'farmers-market', name: 'Farmers market' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'specialty-food', name: 'Specialty' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = defaultCategories,
  selectedCategory,
  onCategorySelect,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.scroll}
    style={styles.container}
  >
    {categories.map((category) => {
      const isSelected =
        category.id === 'all' ? selectedCategory === null : selectedCategory === category.id;

      return (
        <TouchableOpacity
          key={category.id}
          style={[styles.chip, isSelected && styles.chipSelected]}
          onPress={() => onCategorySelect(category.id === 'all' ? null : category.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, isSelected && styles.labelSelected]}>{category.name}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
