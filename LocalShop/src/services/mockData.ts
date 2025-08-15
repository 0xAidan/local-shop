import { Shop, Category, Product, User } from '../types';

export const mockShops: Shop[] = [
  {
    id: 1,
    name: 'Fresh Farm Market',
    rating: 4.8,
    distance: '0.5 km',
    category: 'Produce',
    description: 'Fresh organic vegetables and fruits from local farms',
    location: {
      latitude: 48.3809,
      longitude: -89.2477,
      address: '123 Main St, Thunder Bay, ON'
    },
    owner: {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'https://example.com/avatar1.jpg'
    }
  },
  {
    id: 2,
    name: 'Artisan Bakery',
    rating: 4.9,
    distance: '1.2 km',
    category: 'Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    location: {
      latitude: 48.3810,
      longitude: -89.2478,
      address: '456 Oak Ave, Thunder Bay, ON'
    },
    owner: {
      id: 2,
      name: 'Mike Chen',
      avatar: 'https://example.com/avatar2.jpg'
    }
  },
  {
    id: 3,
    name: 'Local Crafts',
    rating: 4.7,
    distance: '0.8 km',
    category: 'Handmade',
    description: 'Unique handmade jewelry and home decor',
    location: {
      latitude: 48.3811,
      longitude: -89.2479,
      address: '789 Pine Rd, Thunder Bay, ON'
    },
    owner: {
      id: 3,
      name: 'Emma Wilson',
      avatar: 'https://example.com/avatar3.jpg'
    }
  },
  {
    id: 4,
    name: 'Vintage Finds',
    rating: 4.6,
    distance: '1.5 km',
    category: 'Vintage',
    description: 'Curated collection of vintage clothing and accessories',
    location: {
      latitude: 48.3812,
      longitude: -89.2480,
      address: '321 Elm St, Thunder Bay, ON'
    },
    owner: {
      id: 4,
      name: 'David Brown',
      avatar: 'https://example.com/avatar4.jpg'
    }
  },
  {
    id: 5,
    name: 'Organic Butcher',
    rating: 4.9,
    distance: '2.1 km',
    category: 'Meat',
    description: 'Premium organic meats from local farms',
    location: {
      latitude: 48.3813,
      longitude: -89.2481,
      address: '654 Maple Dr, Thunder Bay, ON'
    },
    owner: {
      id: 5,
      name: 'Lisa Anderson',
      avatar: 'https://example.com/avatar5.jpg'
    }
  },
  {
    id: 6,
    name: 'Farm Fresh',
    rating: 4.8,
    distance: '3.0 km',
    category: 'Produce',
    description: 'Fresh vegetables and dairy from our family farm',
    location: {
      latitude: 48.3814,
      longitude: -89.2482,
      address: '987 Farm Rd, Thunder Bay, ON'
    },
    owner: {
      id: 6,
      name: 'Tom Martinez',
      avatar: 'https://example.com/avatar6.jpg'
    }
  },
  {
    id: 7,
    name: 'Handmade Soaps',
    rating: 4.7,
    distance: '1.8 km',
    category: 'Beauty',
    description: 'Natural handmade soaps and skincare products',
    location: {
      latitude: 48.3815,
      longitude: -89.2483,
      address: '147 Cedar Ln, Thunder Bay, ON'
    },
    owner: {
      id: 7,
      name: 'Rachel Green',
      avatar: 'https://example.com/avatar7.jpg'
    }
  },
  {
    id: 8,
    name: 'Woodworking',
    rating: 4.8,
    distance: '2.5 km',
    category: 'Furniture',
    description: 'Custom wooden furniture and home accessories',
    location: {
      latitude: 48.3816,
      longitude: -89.2484,
      address: '258 Birch Way, Thunder Bay, ON'
    },
    owner: {
      id: 8,
      name: 'James Wilson',
      avatar: 'https://example.com/avatar8.jpg'
    }
  }
];

export const mockCategories: Category[] = [
  {
    title: 'Trending',
    shops: mockShops.slice(0, 2)
  },
  {
    title: 'For you',
    shops: mockShops.slice(2, 4)
  },
  {
    title: 'Meat & Produce',
    shops: mockShops.slice(4, 6)
  },
  {
    title: 'Goods',
    shops: mockShops.slice(6, 8)
  }
];

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Organic Tomatoes',
    price: 3.99,
    description: 'Fresh organic tomatoes from our greenhouse',
    category: 'Vegetables',
    shopId: 1,
    inStock: true
  },
  {
    id: 2,
    name: 'Sourdough Bread',
    price: 5.99,
    description: 'Traditional sourdough bread made with local flour',
    category: 'Bread',
    shopId: 2,
    inStock: true
  },
  {
    id: 3,
    name: 'Handmade Necklace',
    price: 25.00,
    description: 'Unique beaded necklace made with local materials',
    category: 'Jewelry',
    shopId: 3,
    inStock: true
  }
];

export const mockUser: User = {
  id: 1,
  username: 'johnsmith',
  email: 'john@example.com',
  avatar: 'https://example.com/user-avatar.jpg',
  location: {
    latitude: 48.3809,
    longitude: -89.2477,
    city: 'Thunder Bay'
  },
  isSeller: false
}; 