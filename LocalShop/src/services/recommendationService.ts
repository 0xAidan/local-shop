import { Shop, User } from '../types';

export interface RecommendationScore {
  shop: Shop;
  score: number;
  reasons: string[];
}

export interface UserPreferences {
  favoriteCategories: string[];
  preferredFeatures: string[];
  maxDistance: number;
  minRating: number;
  dietaryPreferences: string[];
}

class RecommendationService {
  // Calculate recommendation score for a shop based on user preferences
  private calculateShopScore(
    shop: Shop,
    user: User | null,
    userLocation?: { latitude: number; longitude: number }
  ): RecommendationScore {
    let score = 0;
    const reasons: string[] = [];

    // Base score from rating (0-40 points)
    if (shop.rating?.average) {
      const ratingScore = (shop.rating.average / 5) * 40;
      score += ratingScore;
      reasons.push(`High rating: ${shop.rating.average.toFixed(1)}/5`);
    }

    // Distance score (0-30 points)
    if (userLocation && shop.location.coordinates) {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        shop.location.coordinates.latitude,
        shop.location.coordinates.longitude
      );
      
      // Convert distance to score (closer = higher score)
      const distanceScore = Math.max(0, 30 - (distance * 2));
      score += distanceScore;
      
      if (distance < 5) {
        reasons.push('Very close to you');
      } else if (distance < 10) {
        reasons.push('Close to your location');
      }
    }

    // User preferences score (0-20 points)
    if (user?.preferences) {
      // Category preference
      if (user.preferences.dietary) {
        const dietaryPrefs = Object.entries(user.preferences.dietary)
          .filter(([_, value]) => value)
          .map(([key]) => key.toLowerCase());

        if (shop.features) {
          const matchingFeatures = shop.features.filter(feature =>
            dietaryPrefs.some(pref => feature.toLowerCase().includes(pref))
          );
          
          if (matchingFeatures.length > 0) {
            score += 10;
            reasons.push(`Matches your dietary preferences: ${matchingFeatures.join(', ')}`);
          }
        }
      }

      // Rating preference
      if (user.preferences.radius && shop.rating?.average) {
        if (shop.rating.average >= 4.0) {
          score += 5;
          reasons.push('Highly rated by community');
        }
      }
    }

    // Popularity boost (0-10 points)
    if (shop.rating?.count && shop.rating.count > 10) {
      score += Math.min(10, shop.rating.count / 10);
      reasons.push('Popular with many reviews');
    }

    // New shop bonus (0-5 points)
    if (shop.createdAt) {
      const daysSinceCreation = (Date.now() - new Date(shop.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 30) {
        score += 5;
        reasons.push('Recently added');
      }
    }

    // Verified shop bonus (0-5 points)
    if (shop.isVerified) {
      score += 5;
      reasons.push('Verified business');
    }

    return {
      shop,
      score: Math.round(score),
      reasons
    };
  }

  // Calculate distance between two coordinates using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get personalized recommendations for a user
  getPersonalizedRecommendations(
    shops: Shop[],
    user: User | null,
    userLocation?: { latitude: number; longitude: number },
    limit: number = 10
  ): RecommendationScore[] {
    const scoredShops = shops.map(shop =>
      this.calculateShopScore(shop, user, userLocation)
    );

    // Sort by score (highest first)
    scoredShops.sort((a, b) => b.score - a.score);

    return scoredShops.slice(0, limit);
  }

  // Get trending shops (based on recent activity and ratings)
  getTrendingShops(shops: Shop[], limit: number = 10): Shop[] {
    return shops
      .filter(shop => shop.rating?.count && shop.rating.count > 5)
      .sort((a, b) => {
        // Sort by a combination of rating and review count
        const scoreA = (a.rating?.average || 0) * Math.log(a.rating?.count || 1);
        const scoreB = (b.rating?.average || 0) * Math.log(b.rating?.count || 1);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Get nearby shops
  getNearbyShops(
    shops: Shop[],
    userLocation: { latitude: number; longitude: number },
    radiusKm: number = 10,
    limit: number = 10
  ): Shop[] {
    return shops
      .filter(shop => {
        if (!shop.location.coordinates) return false;
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          shop.location.coordinates.latitude,
          shop.location.coordinates.longitude
        );
        return distance <= radiusKm;
      })
      .sort((a, b) => {
        const distanceA = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.location.coordinates.latitude,
          a.location.coordinates.longitude
        );
        const distanceB = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.location.coordinates.latitude,
          b.location.coordinates.longitude
        );
        return distanceA - distanceB;
      })
      .slice(0, limit);
  }

  // Get shops by category with smart sorting
  getShopsByCategory(
    shops: Shop[],
    category: string,
    user: User | null,
    userLocation?: { latitude: number; longitude: number },
    limit: number = 10
  ): RecommendationScore[] {
    const categoryShops = shops.filter(shop => 
      shop.category.toLowerCase() === category.toLowerCase()
    );

    return this.getPersonalizedRecommendations(
      categoryShops,
      user,
      userLocation,
      limit
    );
  }

  // Get featured shops (highly rated, verified, popular)
  getFeaturedShops(shops: Shop[], limit: number = 10): Shop[] {
    return shops
      .filter(shop => 
        shop.isVerified && 
        shop.rating?.average && 
        shop.rating.average >= 4.0 &&
        shop.rating.count >= 5
      )
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0))
      .slice(0, limit);
  }

  // Get new shops (recently added)
  getNewShops(shops: Shop[], limit: number = 10): Shop[] {
    return shops
      .filter(shop => shop.createdAt)
      .sort((a, b) => 
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      )
      .slice(0, limit);
  }

  // Get recommendations based on user's favorite shops
  getSimilarShops(
    shops: Shop[],
    favoriteShops: Shop[],
    limit: number = 10
  ): RecommendationScore[] {
    if (favoriteShops.length === 0) {
      return this.getTrendingShops(shops, limit).map(shop => ({
        shop,
        score: 0,
        reasons: ['Based on trending shops']
      }));
    }

    // Extract common features from favorite shops
    const favoriteCategories = favoriteShops.map(shop => shop.category);
    const favoriteFeatures = favoriteShops
      .flatMap(shop => shop.features || [])
      .filter((feature, index, arr) => arr.indexOf(feature) === index);

    // Score shops based on similarity to favorites
    const scoredShops = shops
      .filter(shop => !favoriteShops.some(fav => fav.id === shop.id))
      .map(shop => {
        let score = 0;
        const reasons: string[] = [];

        // Category similarity
        if (favoriteCategories.includes(shop.category)) {
          score += 30;
          reasons.push(`Similar to your favorite ${shop.category} shops`);
        }

        // Feature similarity
        if (shop.features) {
          const matchingFeatures = shop.features.filter(feature =>
            favoriteFeatures.includes(feature)
          );
          score += matchingFeatures.length * 10;
          if (matchingFeatures.length > 0) {
            reasons.push(`Has features you like: ${matchingFeatures.join(', ')}`);
          }
        }

        // Rating similarity
        const avgFavoriteRating = favoriteShops.reduce((sum, shop) => 
          sum + (shop.rating?.average || 0), 0
        ) / favoriteShops.length;
        
        if (shop.rating?.average && Math.abs(shop.rating.average - avgFavoriteRating) < 1) {
          score += 20;
          reasons.push('Similar quality to your favorites');
        }

        return { shop, score, reasons };
      });

    return scoredShops
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const recommendationService = new RecommendationService(); 