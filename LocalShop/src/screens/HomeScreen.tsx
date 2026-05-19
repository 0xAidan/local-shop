import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeHeader } from '../components/home/HomeHeader';
import { CategoryFilter } from '../components/CategoryFilter';
import { FeaturedShopCard } from '../components/home/FeaturedShopCard';
import { ShopListRow } from '../components/home/ShopListRow';
import { SectionHeader } from '../components/home/SectionHeader';
import { ShopCarousel } from '../components/ShopCarousel';
import { SearchFilters } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import { recommendationService, RecommendationScore } from '../services/recommendationService';
import { Shop, User } from '../types';
import { colors, layout } from '../theme/colors';

interface HomeScreenProps {
  navigation: { navigate: (screen: string, params?: object) => void };
}

const CATEGORY_MAP: Record<string, string> = {
  'farmers-market': 'Farmers Market',
  bakery: 'Bakery',
  'specialty-food': 'Specialty Food',
  coffee: 'Coffee',
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLocation] = useState('Thunder Bay');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);

  const loadShops = async () => {
    const response = await apiService.getShops();
    setShops(response.shops);
  };

  const loadUser = async () => {
    if (!apiService.isAuthenticated()) return;
    const currentUser = await apiService.getCurrentUser();
    setUser(currentUser);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadShops(), loadUser()]);
    } catch (error) {
      console.error('Error loading home:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (shops.length === 0) return;
    const mockUserLocation = { latitude: 48.3809, longitude: -89.2477 };
    setRecommendations(
      recommendationService.getPersonalizedRecommendations(shops, user, mockUserLocation, 6)
    );
    setTrendingShops(recommendationService.getTrendingShops(shops, 6));
  }, [shops, user]);

  useEffect(() => {
    let filtered = [...shops];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(q) ||
          shop.description?.toLowerCase().includes(q) ||
          shop.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      const label = CATEGORY_MAP[selectedCategory];
      if (label) filtered = filtered.filter((shop) => shop.category === label);
    }

    if (activeFilters.category && activeFilters.category !== 'All Categories') {
      filtered = filtered.filter((shop) => shop.category === activeFilters.category);
    }

    if (activeFilters.rating) {
      filtered = filtered.filter(
        (shop) => shop.rating?.average && shop.rating.average >= activeFilters.rating!
      );
    }

    if (activeFilters.features?.length) {
      filtered = filtered.filter((shop) =>
        activeFilters.features!.some((f) => shop.features?.includes(f))
      );
    }

    setFilteredShops(filtered);
  }, [shops, searchQuery, activeFilters, selectedCategory]);

  const featuredShop = useMemo(() => {
    if (filteredShops.length === 0) return null;
    const topRec = recommendations.find((r) =>
      filteredShops.some((s) => (s.id ?? s._id) === (r.shop.id ?? r.shop._id))
    );
    return topRec?.shop ?? filteredShops[0];
  }, [filteredShops, recommendations]);

  const listShops = useMemo(() => {
    if (!featuredShop) return filteredShops;
    const featuredId = featuredShop.id ?? featuredShop._id;
    return filteredShops.filter((s) => (s.id ?? s._id) !== featuredId);
  }, [filteredShops, featuredShop]);

  const trendingFiltered = useMemo(
    () =>
      trendingShops.filter((t) =>
        listShops.some((s) => (s.id ?? s._id) === (t.id ?? t._id))
      ),
    [trendingShops, listShops]
  );

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== null ||
    Object.keys(activeFilters).length > 0;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  }, []);

  const handleShopPress = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shop });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilters({});
    setSelectedCategory(null);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <StatusBar barStyle="light-content" />
        <LoadingSpinner message="Loading shops" fullScreen />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper showBottomPadding={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.root}>
        <HomeHeader
          user={user}
          userLocation={userLocation}
          onSearch={setSearchQuery}
          onFilterChange={setActiveFilters}
          onProfilePress={() => navigation.navigate('Profile')}
          onLocationPress={() => Alert.alert('Location', 'Location picker coming soon.')}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 96 },
          ]}
        >
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          {hasActiveFilters && (
            <Text style={styles.resultCount}>
              {filteredShops.length} {filteredShops.length === 1 ? 'shop' : 'shops'}
            </Text>
          )}

          {filteredShops.length === 0 ? (
            <EmptyState
              title="No shops found"
              message="Try a different search or category."
              iconName="storefront-outline"
              actionText="Clear filters"
              onAction={handleClearFilters}
            />
          ) : (
            <>
              {featuredShop && !hasActiveFilters && (
                <View style={styles.section}>
                  <SectionHeader title="Featured" />
                  <FeaturedShopCard shop={featuredShop} onPress={handleShopPress} />
                </View>
              )}

              {trendingFiltered.length > 0 && !hasActiveFilters && (
                <View style={styles.section}>
                  <SectionHeader title="Trending" />
                  <ShopCarousel shops={trendingFiltered.slice(0, 5)} onShopPress={handleShopPress} />
                </View>
              )}

              <View style={styles.section}>
                <SectionHeader
                  title={hasActiveFilters ? 'Results' : 'All shops'}
                  actionLabel={hasActiveFilters ? undefined : undefined}
                />
                <View style={styles.list}>
                  {listShops.map((shop, index) => (
                    <ShopListRow
                      key={String(shop.id ?? shop._id ?? index)}
                      shop={shop}
                      onPress={handleShopPress}
                    />
                  ))}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingTop: 8,
  },
  section: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: layout.sectionGap,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  resultCount: {
    fontSize: 14,
    color: colors.textMuted,
    paddingHorizontal: layout.screenPadding,
    marginBottom: 12,
  },
});
