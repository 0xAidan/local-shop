import { apiService } from './api';
import { Review, ReviewStats } from '../types';

export interface CreateReviewData {
  orderId: string;
  type: 'product' | 'shop';
  itemId: string;
  rating: number;
  content?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    caption?: string;
  }>;
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    caption?: string;
  }>;
}

export interface DisputeReviewData {
  reason: 'inappropriate_content' | 'false_information' | 'spam' | 'harassment' | 'other';
  description: string;
}

export interface ShopReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: ReviewStats;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserReviewsResponse {
  reviews: Review[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ShopReviewStatsResponse {
  stats: ReviewStats;
  recentReviews: Review[];
}

export const reviewApi = {
  createReview: async (
    data: CreateReviewData,
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const res = (await apiService.reviewsCreate(data as unknown as Record<string, unknown>)) as {
      success: boolean;
      message?: string;
      data: Review;
    };
    return {
      success: res.success,
      message: res.message || '',
      data: res.data,
    };
  },

  getShopReviews: async (
    shopId: string,
    options: {
      type?: 'product' | 'shop';
      rating?: number;
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    } = {},
  ): Promise<ShopReviewsResponse> => {
    const res = (await apiService.reviewsShopList(shopId, {
      type: options.type,
      rating: options.rating,
      page: options.page,
      limit: options.limit,
      sort: options.sort,
    })) as {
      data: {
        reviews: Review[];
        pagination: ShopReviewsResponse['pagination'];
        stats: ReviewStats;
      };
    };
    const d = res.data;
    return {
      reviews: d.reviews || [],
      pagination: d.pagination,
      stats: d.stats,
    };
  },

  getProductReviews: async (
    productId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    } = {},
  ): Promise<ProductReviewsResponse> => {
    const res = (await apiService.reviewsProductList(productId, {
      page: options.page,
      limit: options.limit,
      sort: options.sort,
    })) as {
      data: {
        reviews: Review[];
        pagination: ProductReviewsResponse['pagination'];
      };
    };
    const d = res.data;
    return {
      reviews: d.reviews || [],
      pagination: d.pagination,
    };
  },

  getUserReviews: async (
    options: {
      page?: number;
      limit?: number;
    } = {},
  ): Promise<UserReviewsResponse> => {
    const res = (await apiService.reviewsMyList(options)) as {
      data: {
        reviews: Review[];
        pagination: UserReviewsResponse['pagination'];
      };
    };
    const d = res.data;
    return {
      reviews: d.reviews || [],
      pagination: d.pagination,
    };
  },

  updateReview: async (
    reviewId: string,
    data: UpdateReviewData,
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const res = (await apiService.reviewsUpdate(reviewId, data as Record<string, unknown>)) as {
      success: boolean;
      message?: string;
      data: Review;
    };
    return { success: res.success, message: res.message || '', data: res.data };
  },

  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const res = (await apiService.reviewsDelete(reviewId)) as {
      success: boolean;
      message?: string;
    };
    return { success: res.success, message: res.message || '' };
  },

  toggleReviewVisibility: async (
    reviewId: string,
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const res = (await apiService.reviewsToggleVisibility(reviewId)) as {
      success: boolean;
      message?: string;
      data: Review;
    };
    return { success: res.success, message: res.message || '', data: res.data };
  },

  disputeReview: async (
    reviewId: string,
    data: DisputeReviewData,
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const res = (await apiService.reviewsDispute(reviewId, {
      reason: data.reason,
      description: data.description,
    })) as { success: boolean; message?: string; data: Review };
    return { success: res.success, message: res.message || '', data: res.data };
  },

  markHelpful: async (
    reviewId: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: { helpfulVotes: { count: number; voters: string[] } };
  }> => {
    const res = (await apiService.reviewsMarkHelpful(reviewId)) as {
      success: boolean;
      message?: string;
      data: { helpfulVotes: { count: number; voters: string[] } };
    };
    return {
      success: res.success,
      message: res.message || '',
      data: res.data,
    };
  },

  getShopReviewStats: async (shopId: string): Promise<ShopReviewStatsResponse> => {
    const res = (await apiService.reviewsShopStats(shopId)) as {
      data: { stats: ReviewStats; recentReviews: Review[] };
    };
    return {
      stats: res.data.stats,
      recentReviews: res.data.recentReviews || [],
    };
  },
};
