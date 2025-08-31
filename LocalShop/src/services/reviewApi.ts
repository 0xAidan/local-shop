import { api } from './api';
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
  // Create a new review
  createReview: async (data: CreateReviewData): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // Get reviews for a shop
  getShopReviews: async (
    shopId: string,
    options: {
      type?: 'product' | 'shop';
      rating?: number;
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    } = {}
  ): Promise<ShopReviewsResponse> => {
    const params = new URLSearchParams();
    if (options.type) params.append('type', options.type);
    if (options.rating) params.append('rating', options.rating.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sort) params.append('sort', options.sort);

    const response = await api.get(`/reviews/shop/${shopId}?${params.toString()}`);
    return response.data.data;
  },

  // Get reviews for a specific product
  getProductReviews: async (
    productId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
    } = {}
  ): Promise<ProductReviewsResponse> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sort) params.append('sort', options.sort);

    const response = await api.get(`/reviews/product/${productId}?${params.toString()}`);
    return response.data.data;
  },

  // Get user's reviews
  getUserReviews: async (
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<UserReviewsResponse> => {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`/reviews/my-reviews?${params.toString()}`);
    return response.data.data;
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    data: UpdateReviewData
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await api.patch(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Toggle review content visibility (shop owner only)
  toggleReviewVisibility: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await api.patch(`/reviews/${reviewId}/toggle-visibility`);
    return response.data;
  },

  // Dispute a review (shop owner only)
  disputeReview: async (
    reviewId: string,
    data: DisputeReviewData
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await api.post(`/reviews/${reviewId}/dispute`, data);
    return response.data;
  },

  // Vote helpful on a review
  voteHelpful: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string; data: { helpfulVotes: { count: number; voters: string[] } } }> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Get review statistics for a shop (shop owner only)
  getShopReviewStats: async (shopId: string): Promise<ShopReviewStatsResponse> => {
    const response = await api.get(`/reviews/shop/${shopId}/stats`);
    return response.data.data;
  }
}; 