import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reviewApi, ShopReviewsResponse, ProductReviewsResponse } from '../services/reviewApi';
import { Review } from '../types';

interface ReviewListProps {
  type: 'shop' | 'product';
  itemId: string;
  showStats?: boolean;
  onReviewPress?: (review: Review) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  type,
  itemId,
  showStats = false,
  onReviewPress,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalReviews, setTotalReviews] = useState(0);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const loadReviews = async (page = 1, refresh = false) => {
    try {
      setLoading(true);
      
      let response: ShopReviewsResponse | ProductReviewsResponse;
      
      if (type === 'shop') {
        response = await reviewApi.getShopReviews(itemId, {
          page,
          limit: 10,
          sort: sortBy,
          rating: filterRating || undefined,
        });
        setStats((response as ShopReviewsResponse).stats);
      } else {
        response = await reviewApi.getProductReviews(itemId, {
          page,
          limit: 10,
          sort: sortBy,
        });
      }

      if (refresh || page === 1) {
        setReviews(response.reviews);
      } else {
        setReviews([...reviews, ...response.reviews]);
      }

      setCurrentPage(page);
      setHasNext(response.pagination.hasNext);
      setHasPrev(response.pagination.hasPrev);
      setTotalReviews(response.pagination.totalReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews(1, true);
  }, [itemId, sortBy, filterRating]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews(1, true);
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadReviews(currentPage + 1);
    }
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleRatingFilter = (rating: number | null) => {
    setFilterRating(rating);
    setCurrentPage(1);
  };

  const renderRatingFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by rating:</Text>
      <View style={styles.ratingFilters}>
        {[null, 5, 4, 3, 2, 1].map((rating) => (
          <TouchableOpacity
            key={rating || 'all'}
            style={[
              styles.ratingFilterButton,
              filterRating === rating && styles.ratingFilterButtonActive,
            ]}
            onPress={() => handleRatingFilter(rating)}
          >
            <Text
              style={[
                styles.ratingFilterText,
                filterRating === rating && styles.ratingFilterTextActive,
              ]}
            >
              {rating ? `${rating}+ stars` : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortOptions = () => (
    <View style={styles.sortContainer}>
      <Text style={styles.sortTitle}>Sort by:</Text>
      <View style={styles.sortButtons}>
        {[
          { key: 'newest', label: 'Newest' },
          { key: 'oldest', label: 'Oldest' },
          { key: 'highest', label: 'Highest' },
          { key: 'lowest', label: 'Lowest' },
          { key: 'helpful', label: 'Most Helpful' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.sortButtonActive,
            ]}
            onPress={() => handleSortChange(option.key as typeof sortBy)}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === option.key && styles.sortButtonTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderReviewItem = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={styles.reviewItem}
      onPress={() => onReviewPress?.(item)}
      disabled={!onReviewPress}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={16}
              color={star <= item.rating ? '#FFD700' : '#D1D5DB'}
            />
          ))}
        </View>
      </View>

      {item.content && item.isContentVisible && (
        <Text style={styles.reviewContent}>{item.content}</Text>
      )}

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
          <Text style={styles.helpfulText}>
            Helpful ({item.helpfulVotes.count})
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => {
    if (!stats || type !== 'shop') return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{stats.averageRating.toFixed(1)}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= stats.averageRating ? 'star' : 'star-outline'}
                size={20}
                color={star <= stats.averageRating ? '#FFD700' : '#D1D5DB'}
              />
            ))}
          </View>
          <Text style={styles.totalReviews}>
            {stats.totalReviews} reviews
          </Text>
        </View>

        <View style={styles.ratingDistribution}>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating.toString() as keyof typeof stats.ratingDistribution] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <View key={rating} style={styles.ratingBar}>
                <Text style={styles.ratingLabel}>{rating} stars</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.ratingCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading && currentPage === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showStats && renderStats()}
      
      {renderRatingFilter()}
      {renderSortOptions()}

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item._id || item.order}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && currentPage > 1 ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.loadMoreText}>Loading more reviews...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySubtitle}>
                Be the first to share your experience!
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingDistribution: {
    gap: 8,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    width: 60,
    fontSize: 12,
    color: '#6B7280',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  ratingCount: {
    width: 30,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ratingFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  ratingFilterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingFilterTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  sortButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  reviewItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  helpfulText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 