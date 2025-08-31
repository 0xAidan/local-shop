import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reviewApi, CreateReviewData } from '../services/reviewApi';
import { Review } from '../types';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onReviewSubmitted: (review: Review) => void;
  orderId: string;
  type: 'product' | 'shop';
  itemId: string;
  itemName: string;
  itemImage?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onClose,
  onReviewSubmitted,
  orderId,
  type,
  itemId,
  itemName,
  itemImage,
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting your review.');
      return;
    }

    if (content.trim().length < 10) {
      Alert.alert('Review Content', 'Please write at least 10 characters for your review.');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData: CreateReviewData = {
        orderId,
        type,
        itemId,
        rating,
        content: content.trim(),
        tags,
      };

      const response = await reviewApi.createReview(reviewData);

      if (response.success) {
        Alert.alert(
          'Review Submitted!',
          'Thank you for your review. It helps other customers make informed decisions.',
          [
            {
              text: 'OK',
              onPress: () => {
                onReviewSubmitted(response.data);
                handleClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent('');
    setTags([]);
    onClose();
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRatingPress(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={32}
              color={star <= rating ? '#FFD700' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTags = () => {
    const availableTags = [
      'Great quality',
      'Fast service',
      'Good value',
      'Friendly staff',
      'Clean environment',
      'Fresh ingredients',
      'Convenient location',
      'Worth the price',
    ];

    return (
      <View style={styles.tagsContainer}>
        <Text style={styles.sectionTitle}>Tags (optional)</Text>
        <View style={styles.tagsGrid}>
          {availableTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                tags.includes(tag) && styles.tagButtonSelected,
              ]}
              onPress={() => handleTagToggle(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  tags.includes(tag) && styles.tagTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Write a Review</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Item Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemType}>
              {type === 'product' ? 'Product' : 'Shop'} Review
            </Text>
            <Text style={styles.itemName}>{itemName}</Text>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating *</Text>
            <Text style={styles.sectionSubtitle}>
              How would you rate your experience?
            </Text>
            {renderStars()}
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </Text>
            )}
          </View>

          {/* Review Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Review *</Text>
            <Text style={styles.sectionSubtitle}>
              Share your experience (minimum 10 characters)
            </Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Tell us about your experience..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.characterCount}>
              {content.length}/1000 characters
            </Text>
          </View>

          {/* Tags */}
          {renderTags()}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (rating === 0 || content.trim().length < 10 || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={rating === 0 || content.trim().length < 10 || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  itemInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  itemType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#059669',
    marginTop: 8,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#FFFFFF',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  tagButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 