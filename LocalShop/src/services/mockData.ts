import { Shop, Category, Product, User } from '../types';

export const mockShops: Shop[] = [
  {
    id: 1,
    name: 'Fresh Farm Market',
    rating: { average: 4.8, count: 15 },
    distance: '0.5 km',
    category: 'Produce',
    description: 'Fresh organic vegetables and fruits from local farms',
    location: {
      address: '123 Main St',
      coordinates: { latitude: 48.3809, longitude: -89.2477 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 1A1'
    },
    owner: {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Johnson',
      username: 'sarahjohnson',
      avatar: 'https://example.com/avatar1.jpg'
    }
  },
  {
    id: 2,
    name: 'Artisan Bakery',
    rating: { average: 4.9, count: 23 },
    distance: '1.2 km',
    category: 'Bakery',
    description: 'Handcrafted breads and pastries made fresh daily',
    location: {
      address: '456 Oak Ave',
      coordinates: { latitude: 48.3810, longitude: -89.2478 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 2B2'
    },
    owner: {
      id: 2,
      firstName: 'Mike',
      lastName: 'Chen',
      username: 'mikechen',
      avatar: 'https://example.com/avatar2.jpg'
    }
  },
  {
    id: 3,
    name: 'Local Crafts',
    rating: { average: 4.7, count: 18 },
    distance: '0.8 km',
    category: 'Handmade',
    description: 'Unique handmade jewelry and home decor',
    location: {
      address: '789 Pine Rd',
      coordinates: { latitude: 48.3811, longitude: -89.2479 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 3C3'
    },
    owner: {
      id: 3,
      firstName: 'Emma',
      lastName: 'Wilson',
      username: 'emmawilson',
      avatar: 'https://example.com/avatar3.jpg'
    }
  },
  {
    id: 4,
    name: 'Vintage Finds',
    rating: { average: 4.6, count: 12 },
    distance: '1.5 km',
    category: 'Vintage',
    description: 'Curated collection of vintage clothing and accessories',
    location: {
      address: '321 Elm St',
      coordinates: { latitude: 48.3812, longitude: -89.2480 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 4D4'
    },
    owner: {
      id: 4,
      firstName: 'David',
      lastName: 'Brown',
      username: 'davidbrown',
      avatar: 'https://example.com/avatar4.jpg'
    }
  },
  {
    id: 5,
    name: 'Organic Butcher',
    rating: { average: 4.9, count: 31 },
    distance: '2.1 km',
    category: 'Meat',
    description: 'Premium organic meats from local farms',
    location: {
      address: '654 Maple Dr',
      coordinates: { latitude: 48.3813, longitude: -89.2481 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 5E5'
    },
    owner: {
      id: 5,
      firstName: 'Lisa',
      lastName: 'Anderson',
      username: 'lisaanderson',
      avatar: 'https://example.com/avatar5.jpg'
    }
  },
  {
    id: 6,
    name: 'Farm Fresh',
    rating: { average: 4.8, count: 27 },
    distance: '3.0 km',
    category: 'Produce',
    description: 'Fresh vegetables and dairy from our family farm',
    location: {
      address: '987 Farm Rd',
      coordinates: { latitude: 48.3814, longitude: -89.2482 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 6F6'
    },
    owner: {
      id: 6,
      firstName: 'Tom',
      lastName: 'Martinez',
      username: 'tommartinez',
      avatar: 'https://example.com/avatar6.jpg'
    }
  },
  {
    id: 7,
    name: 'Handmade Soaps',
    rating: { average: 4.7, count: 19 },
    distance: '1.8 km',
    category: 'Beauty',
    description: 'Natural handmade soaps and skincare products',
    location: {
      address: '147 Cedar Ln',
      coordinates: { latitude: 48.3815, longitude: -89.2483 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 7G7'
    },
    owner: {
      id: 7,
      firstName: 'Rachel',
      lastName: 'Green',
      username: 'rachelgreen',
      avatar: 'https://example.com/avatar7.jpg'
    }
  },
  {
    id: 8,
    name: 'Woodworking',
    rating: { average: 4.8, count: 14 },
    distance: '2.5 km',
    category: 'Furniture',
    description: 'Custom wooden furniture and home accessories',
    location: {
      address: '258 Birch Way',
      coordinates: { latitude: 48.3816, longitude: -89.2484 },
      city: 'Thunder Bay',
      state: 'ON',
      zipCode: 'P7A 8H8'
    },
    owner: {
      id: 8,
      firstName: 'James',
      lastName: 'Wilson',
      username: 'jameswilson',
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
    shop: '1',
    inventory: {
      quantity: 50,
      unit: 'pieces',
      lowStockThreshold: 10,
      isUnlimited: false
    },
    isAvailable: true
  },
  {
    id: 2,
    name: 'Sourdough Bread',
    price: 5.99,
    description: 'Traditional sourdough bread made with local flour',
    category: 'Bread',
    shop: '2',
    inventory: {
      quantity: 20,
      unit: 'loaves',
      lowStockThreshold: 5,
      isUnlimited: false
    },
    isAvailable: true
  },
  {
    id: 3,
    name: 'Handmade Necklace',
    price: 25.00,
    description: 'Unique beaded necklace made with local materials',
    category: 'Jewelry',
    shop: '3',
    inventory: {
      quantity: 5,
      unit: 'pieces',
      lowStockThreshold: 2,
      isUnlimited: false
    },
    isAvailable: true
  }
];

export const mockUser: User = {
  id: 1,
  username: 'johnsmith',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Smith',
  role: 'customer',
  avatar: {
    url: 'https://example.com/user-avatar.jpg'
  },
  location: {
    address: '123 Main St',
    city: 'Thunder Bay',
    state: 'ON',
    zipCode: 'P7A 1A1',
    coordinates: { latitude: 48.3809, longitude: -89.2477 }
  }
}; 