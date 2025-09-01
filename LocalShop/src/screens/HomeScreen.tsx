import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Animated,
  Modal,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopCarousel } from '../components/ShopCarousel';
import { DynamicHeader } from '../components/DynamicHeader';
import { CategoryFilter, Category } from '../components/CategoryFilter';
import { SearchBar, SearchFilters } from '../components/SearchBar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { apiService } from '../services/api';
import { recommendationService, RecommendationScore } from '../services/recommendationService';
import { Shop, User } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState('Thunder Bay');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Animation and modal states
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Recommendation states
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [newShops, setNewShops] = useState<Shop[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (shops.length > 0) {
      generateRecommendations();
    }
  }, [shops, user]);

  useEffect(() => {
    applyFilters();
  }, [shops, searchQuery, activeFilters, selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadShops(),
        loadUser(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShops = async () => {
    try {
      const response = await apiService.getShops();
      setShops(response.shops);
    } catch (error) {
      console.error('Error loading shops:', error);
    }
  };

  const loadUser = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const currentUser = await apiService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const generateRecommendations = () => {
    // Mock user location for now (in real app, get from GPS)
    const mockUserLocation = { latitude: 48.3809, longitude: -89.2477 }; // Thunder Bay coordinates

    // Generate personalized recommendations
    const personalizedRecs = recommendationService.getPersonalizedRecommendations(
      shops,
      user,
      mockUserLocation,
      8
    );
    setRecommendations(personalizedRecs);

    // Generate other sections
    setTrendingShops(recommendationService.getTrendingShops(shops, 8));
    setNearbyShops(recommendationService.getNearbyShops(shops, mockUserLocation, 15, 8));
    setFeaturedShops(recommendationService.getFeaturedShops(shops, 8));
    setNewShops(recommendationService.getNewShops(shops, 8));
  };

  const applyFilters = () => {
    let filtered = [...shops];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(shop => {
        const categoryMap: Record<string, string> = {
          'farmers-market': 'Farmers Market',
          'bakery': 'Bakery',
          'specialty-food': 'Specialty Food',
          'coffee': 'Coffee',
          'dairy': 'Dairy',
          'meat': 'Meat',
          'organic': 'Organic',
        };
        return shop.category === categoryMap[selectedCategory];
      });
    }

    // Apply other filters
    if (activeFilters.category && activeFilters.category !== 'All Categories') {
      filtered = filtered.filter(shop => shop.category === activeFilters.category);
    }

    if (activeFilters.rating) {
      filtered = filtered.filter(shop => shop.rating?.average && shop.rating.average >= activeFilters.rating!);
    }

    if (activeFilters.features && activeFilters.features.length > 0) {
      filtered = filtered.filter(shop => 
        activeFilters.features!.some(feature => 
          shop.features?.includes(feature)
        )
      );
    }

    setFilteredShops(filtered);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: SearchFilters) => {
    setActiveFilters(filters);
  };

  const handleShopPress = (shop: Shop) => {
    navigation.navigate('ShopDetail', { shop });
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleLocationPress = () => {
    // TODO: Implement location picker
    Alert.alert('Location', 'Location selection will be implemented soon.');
  };

  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.category && activeFilters.category !== 'All Categories') count++;
    if (activeFilters.rating) count++;
    if (activeFilters.distance) count++;
    if (activeFilters.features && activeFilters.features.length > 0) count += activeFilters.features.length;
    return count;
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const onRefresh = React.useCallback(() => {
    handleRefresh();
  }, []);

  // Show search results if there's a search query or filters
  const showSearchResults = searchQuery.trim() || Object.keys(activeFilters).length > 0 || selectedCategory;

  if (loading) {
    return (
      <ScreenWrapper>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <LoadingSpinner 
          message="Loading your local shops..." 
          fullScreen={true}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper showBottomPadding={false}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Dynamic Header */}
        <DynamicHeader
          user={user}
          userLocation={userLocation}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          activeFilters={activeFilters}
          onSearch={handleSearch}
          onCategorySelect={handleCategorySelect}
          onFilterChange={handleFilterChange}
          onProfilePress={handleProfilePress}
          onLocationPress={handleLocationPress}
          scrollY={scrollY}
        />

        {/* Content */}
        <Animated.ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4A90E2"
              colors={["#4A90E2"]}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {showSearchResults ? (
            // Show search results
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
              </Text>
              {filteredShops.length > 0 ? (
                <ShopCarousel
                  title="Search Results"
                  shops={filteredShops}
                  onShopPress={handleShopPress}
                />
              ) : (
                <EmptyState
                  title="No shops found"
                  message="Try adjusting your search terms or filters to find what you're looking for."
                  icon="🏪"
                  actionText="Clear Filters"
                  onAction={() => {
                    setSearchQuery('');
                    setActiveFilters({});
                    setSelectedCategory(null);
                  }}
                />
              )}
            </View>
          ) : (
            // Show regular sections with carousels
            <>
              {/* Personalized Recommendations */}
              {recommendations.length > 0 && (
                <ShopCarousel
                  key="recommendations"
                  title="Recommended for You"
                  shops={recommendations.map(rec => rec.shop)}
                  onShopPress={handleShopPress}
                  showViewAll={true}
                  onViewAllPress={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setActiveFilters({});
                  }}
                />
              )}

              {/* Trending Shops */}
              {trendingShops.length > 0 && (
                <ShopCarousel
                  key="trending"
                  title="Trending Now"
                  shops={trendingShops}
                  onShopPress={handleShopPress}
                />
              )}

              {/* Nearby Shops */}
              {nearbyShops.length > 0 && (
                <ShopCarousel
                  key="nearby"
                  title="Nearby"
                  shops={nearbyShops}
                  onShopPress={handleShopPress}
                />
              )}

              {/* Featured Shops */}
              {featuredShops.length > 0 && (
                <ShopCarousel
                  key="featured"
                  title="Featured"
                  shops={featuredShops}
                  onShopPress={handleShopPress}
                />
              )}

              {/* New Shops */}
              {newShops.length > 0 && (
                <ShopCarousel
                  key="new"
                  title="Recently Added"
                  shops={newShops}
                  onShopPress={handleShopPress}
                />
              )}

              {/* Category Sections */}
              {!showSearchResults && (
                <>
                  <ShopCarousel
                    key="farmers-markets"
                    title="Farmers Markets"
                    shops={shops.filter(shop => shop.category === 'Farmers Market').slice(0, 8)}
                    onShopPress={handleShopPress}
                  />
                  
                  <ShopCarousel
                    key="bakeries"
                    title="Bakeries"
                    shops={shops.filter(shop => shop.category === 'Bakery').slice(0, 8)}
                    onShopPress={handleShopPress}
                  />
                  
                  <ShopCarousel
                    key="specialty-food"
                    title="Specialty Food"
                    shops={shops.filter(shop => shop.category === 'Specialty Food').slice(0, 8)}
                    onShopPress={handleShopPress}
                  />
                </>
              )}
            </>
                      )}
          </Animated.ScrollView>
        </View>

        {/* Search Modal */}
        <Modal
          visible={showSearchModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSearchModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Shops</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSearchModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <SearchBar
              onSearch={(query) => {
                handleSearch(query);
                setShowSearchModal(false);
              }}
              onFilterChange={handleFilterChange}
              placeholder="Search shops, products..."
            />
          </View>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <SearchBar
              onSearch={handleSearch}
              onFilterChange={(filters) => {
                handleFilterChange(filters);
                setShowFilterModal(false);
              }}
              placeholder="Search shops, products..."
            />
          </View>
        </Modal>
      </ScreenWrapper>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingTop: 320, // Account for dynamic header height + extra space for search bar
  },
  scrollContent: {
    paddingBottom: 100, // Account for bottom navigation
  },
  searchResultsContainer: {
    marginBottom: 20,
  },
  searchResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
}); 