import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShopCard } from '../components/ShopCard';
import { SearchBar, SearchFilters } from '../components/SearchBar';
import { apiService } from '../services/api';
import { Shop } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('Thunder Bay');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadShops();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [shops, searchQuery, activeFilters]);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await apiService.getShops();
      setShops(response.shops);
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...shops];

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop => 
        shop.name.toLowerCase().includes(query) ||
        shop.description.toLowerCase().includes(query) ||
        shop.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilters.category && activeFilters.category !== 'All Categories') {
      filtered = filtered.filter(shop => shop.category === activeFilters.category);
    }

    // Apply rating filter
    if (activeFilters.rating) {
      filtered = filtered.filter(shop => shop.rating.average >= activeFilters.rating!);
    }

    // Apply features filter
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

  const CategorySection = ({ title, shops }: { title: string; shops: Shop[] }) => (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.shopsRow}>
        {shops.map((shop) => (
          <ShopCard 
            key={shop.id} 
            shop={shop} 
            onPress={() => handleShopPress(shop)}
          />
        ))}
      </View>
    </View>
  );

  // Group filtered shops by category
  const shopsByCategory = filteredShops.reduce((acc, shop) => {
    if (!acc[shop.category]) {
      acc[shop.category] = [];
    }
    acc[shop.category].push(shop);
    return acc;
  }, {} as Record<string, Shop[]>);

  const categories = [
    { title: 'Trending', shops: filteredShops.slice(0, 2) },
    { title: 'Farmers Markets', shops: shopsByCategory['Farmers Market'] || [] },
    { title: 'Bakeries', shops: shopsByCategory['Bakery'] || [] },
    { title: 'Specialty Food', shops: shopsByCategory['Specialty Food'] || [] },
  ];

  // Show search results if there's a search query
  const showSearchResults = searchQuery.trim() || Object.keys(activeFilters).length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>{userLocation}</Text>
            <View style={styles.userContainer}>
              <Text style={styles.username}>Welcome!</Text>
              <View style={styles.userAvatar} />
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          placeholder="Search shops..."
        />

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading shops...</Text>
            </View>
          ) : showSearchResults ? (
            // Show search results
            <View style={styles.searchResultsContainer}>
              <Text style={styles.searchResultsTitle}>
                {filteredShops.length} shop{filteredShops.length !== 1 ? 's' : ''} found
              </Text>
              {filteredShops.length > 0 ? (
                <View style={styles.searchResultsGrid}>
                  {filteredShops.map((shop) => (
                    <ShopCard 
                      key={shop.id} 
                      shop={shop} 
                      onPress={() => handleShopPress(shop)}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No shops found</Text>
                  <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
                </View>
              )}
            </View>
          ) : (
            // Show regular categories
            categories.map((category, index) => (
              <CategorySection key={index} title={category.title} shops={category.shops} />
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  shopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  searchResultsContainer: {
    marginBottom: 20,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  searchResultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
}); 