import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface OptimizedImageProps {
  source: { uri: string };
  style: ImageStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder = '🖼️',
  fallback = '❌',
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Show fallback if there's an error
  if (hasError) {
    return (
      <View style={[style, styles.fallbackContainer]}>
        <Text style={styles.fallbackText}>{fallback}</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={source}
        style={[style, styles.image]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        // Performance optimizations
        fadeDuration={300}
        progressiveRenderingEnabled={true}
        cachePolicy="memory-disk"
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={[style, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Placeholder while loading */}
      {!imageLoaded && !isLoading && (
        <View style={[style, styles.placeholderContainer]}>
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    position: 'absolute',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  placeholderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  placeholderText: {
    fontSize: 24,
    color: '#ccc',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  fallbackText: {
    fontSize: 24,
    color: '#999',
  },
}); 