import React from 'react';
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
import { apiService } from '../services/api';
import { Shop } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState('Thunder Bay');

  useEffect(() => {
    loadShops();
  }, []);

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

  // Group shops by category
  const shopsByCategory = shops.reduce((acc, shop) => {
    if (!acc[shop.category]) {
      acc[shop.category] = [];
    }
    acc[shop.category].push(shop);
    return acc;
  }, {} as Record<string, Shop[]>);

  const categories = [
    { title: 'Trending', shops: shops.slice(0, 2) },
    { title: 'Farmers Markets', shops: shopsByCategory['Farmers Market'] || [] },
    { title: 'Bakeries', shops: shopsByCategory['Bakery'] || [] },
    { title: 'Specialty Food', shops: shopsByCategory['Specialty Food'] || [] },
  ];

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

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading shops...</Text>
            </View>
          ) : (
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
}); 