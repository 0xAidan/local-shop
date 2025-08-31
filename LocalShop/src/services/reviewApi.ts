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
  // Create a new review
  createReview: async (data: CreateReviewData): Promise<{ success: boolean; message: string; data: Review }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Review creation not implemented yet');
    throw new Error('Review creation not implemented yet');
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
    // TODO: Implement when API service supports HTTP methods
    console.log('Get shop reviews not implemented yet');
    throw new Error('Get shop reviews not implemented yet');
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
    // TODO: Implement when API service supports HTTP methods
    console.log('Get product reviews not implemented yet');
    throw new Error('Get product reviews not implemented yet');
  },

  // Get user's reviews
  getUserReviews: async (
    options: {
      page?: number;
      limit?: number;
    } = {}
  ): Promise<UserReviewsResponse> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Get user reviews not implemented yet');
    throw new Error('Get user reviews not implemented yet');
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    data: UpdateReviewData
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Update review not implemented yet');
    throw new Error('Update review not implemented yet');
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<{ success: boolean; message: string }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Delete review not implemented yet');
    throw new Error('Delete review not implemented yet');
  },

  // Toggle review content visibility (shop owner only)
  toggleReviewVisibility: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Toggle review visibility not implemented yet');
    throw new Error('Toggle review visibility not implemented yet');
  },

  // Dispute a review (shop owner only)
  disputeReview: async (
    reviewId: string,
    data: DisputeReviewData
  ): Promise<{ success: boolean; message: string; data: Review }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Dispute review not implemented yet');
    throw new Error('Dispute review not implemented yet');
  },

  // Mark review as helpful
  markHelpful: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string; data: { helpfulVotes: { count: number; voters: string[] } } }> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Mark helpful not implemented yet');
    throw new Error('Mark helpful not implemented yet');
  },

  // Get review statistics for a shop (shop owner only)
  getShopReviewStats: async (shopId: string): Promise<ShopReviewStatsResponse> => {
    // TODO: Implement when API service supports HTTP methods
    console.log('Get shop review stats not implemented yet');
    throw new Error('Get shop review stats not implemented yet');
  }
}; 