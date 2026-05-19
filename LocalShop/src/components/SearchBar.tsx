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
import { Ionicons } from '@expo/vector-icons';
import { colors, layout } from '../theme/colors';

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
];

const features = ['Delivery', 'Pickup', 'Organic', 'Local', 'Gluten-Free', 'Vegan'];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFilterChange,
  placeholder = 'Search shops',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeCount = [
    filters.category && filters.category !== 'All Categories',
    filters.rating,
    filters.features?.length,
  ].filter(Boolean).length;

  return (
    <View>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        <TouchableOpacity
          style={[styles.filterBtn, activeCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
          accessibilityLabel="Filters"
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeCount > 0 ? colors.textPrimary : colors.textMuted}
          />
          {activeCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)} hitSlop={12}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.chipGrid}>
                {categories.map((category) => {
                  const active = filters.category === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => handleFilterChange({ category })}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Minimum rating</Text>
              <View style={styles.chipGrid}>
                {[3, 4, 4.5].map((rating) => {
                  const active = filters.rating === rating;
                  return (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => handleFilterChange({ rating })}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{rating}+ stars</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Features</Text>
              <View style={styles.chipGrid}>
                {features.map((feature) => {
                  const selected = filters.features?.includes(feature);
                  return (
                    <TouchableOpacity
                      key={feature}
                      style={[styles.chip, selected && styles.chipActive]}
                      onPress={() => {
                        const current = filters.features ?? [];
                        const next = selected
                          ? current.filter((f) => f !== feature)
                          : [...current, feature];
                        handleFilterChange({ features: next });
                      }}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{feature}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={clearFilters}>
                <Text style={styles.secondaryBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowFilters(false)}>
                <Text style={styles.primaryBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 10,
  },
  filterBtn: {
    padding: 6,
    marginLeft: 4,
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: layout.screenPadding,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sheetBody: {
    padding: layout.screenPadding,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: layout.chipRadius,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(107, 154, 196, 0.15)',
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: layout.screenPadding,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: layout.cardRadius,
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
