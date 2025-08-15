# Local Shop Backend API

A comprehensive backend API for the Local Shop app, providing shop management, product catalog, user authentication, and location-based services.

## 🚀 Features

### Shop Management
- **Shop Creation & Management**: Shop owners can create and manage their shop profiles
- **Location Services**: Automatic geocoding of addresses with Google Maps API
- **Shop Categories**: Support for various shop types (Grocery, Restaurant, Bakery, etc.)
- **Operating Hours**: Flexible business hours management
- **Shop Features**: Support for delivery, pickup, dietary restrictions, etc.

### Product Management
- **Detailed Product Catalog**: Comprehensive product information with pricing, inventory, and descriptions
- **Product Categories & Subcategories**: Organized product classification
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Product Variants**: Support for different sizes, colors, flavors, etc.
- **Dietary Information**: Gluten-free, vegan, organic, halal, kosher, etc.
- **Nutritional Information**: Calories, protein, carbs, fat, etc.
- **Product Reviews**: Customer ratings and reviews system

### User Management
- **Authentication**: JWT-based authentication with secure password hashing
- **User Roles**: Customer and Shop Owner roles with different permissions
- **Profile Management**: User profiles with preferences and dietary restrictions
- **Favorites System**: Users can save and manage favorite shops
- **Review System**: Users can rate and review shops and products

### Image Management
- **Cloudinary Integration**: Secure image upload and storage
- **Image Optimization**: Automatic resizing and compression
- **Avatar Support**: Profile picture management
- **Product Images**: Multiple images per product with primary image support

### Location Services
- **Geocoding**: Convert addresses to coordinates
- **Location-based Search**: Find shops near user location
- **Distance Calculation**: Calculate distances between locations
- **Radius-based Filtering**: Search shops within specified radius

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Google Maps API** - Geocoding services
- **Multer** - File upload handling
- **Express Validator** - Input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Google Maps API key
- Cloudinary account

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/local-shop
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "customer"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Shop Endpoints

#### Get All Shops
```http
GET /api/shops?page=1&limit=10&category=Grocery&lat=40.7128&lng=-74.0060&radius=10
```

#### Create Shop
```http
POST /api/shops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fresh Market",
  "description": "Local grocery store with fresh produce",
  "category": "Grocery",
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "contact": {
    "phone": "+1234567890",
    "email": "info@freshmarket.com"
  },
  "hours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" }
  },
  "features": ["Delivery", "Organic", "Local"]
}
```

#### Update Shop
```http
PUT /api/shops/:shopId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Shop Name",
  "description": "Updated description"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=20&shopId=shopId&category=Fruits&minPrice=1&maxPrice=10
```

#### Create Product
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Organic Apples",
  "description": "Fresh organic apples from local farms",
  "price": 4.99,
  "category": "Fruits",
  "shop": "shopId",
  "inventory": {
    "quantity": 50,
    "unit": "lb",
    "lowStockThreshold": 10
  },
  "dietary": {
    "isOrganic": true,
    "isGlutenFree": true
  },
  "tags": ["organic", "local", "fresh"]
}
```

#### Update Product Inventory
```http
PATCH /api/products/:productId/inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 25,
  "isUnlimited": false
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Add Shop to Favorites
```http
POST /api/users/favorites/:shopId
Authorization: Bearer <token>
```

#### Get User's Shops
```http
GET /api/users/shops
Authorization: Bearer <token>
```

### Upload Endpoints

#### Upload Single Image
```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- image: [file]
```

#### Upload Multiple Images
```http
POST /api/upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- images: [files]
```

## 🔧 Database Schema

### Shop Schema
```javascript
{
  name: String,
  description: String,
  category: String,
  location: {
    address: String,
    coordinates: { latitude: Number, longitude: Number },
    city: String,
    state: String,
    zipCode: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  hours: Object,
  images: Array,
  owner: ObjectId,
  isActive: Boolean,
  rating: { average: Number, count: Number },
  tags: Array,
  features: Array
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  shop: ObjectId,
  inventory: {
    quantity: Number,
    unit: String,
    lowStockThreshold: Number,
    isUnlimited: Boolean
  },
  images: Array,
  dietary: Object,
  allergens: Array,
  reviews: Array,
  averageRating: Number
}
```

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  shops: Array,
  favorites: Array,
  preferences: Object
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: Built-in rate limiting protection
- **Helmet**: Security headers middleware
- **Input Sanitization**: Protection against injection attacks

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/local-shop
JWT_SECRET=your-production-jwt-secret
GOOGLE_MAPS_API_KEY=your-production-google-maps-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 API Versioning

The API uses URL versioning. Current version: v1
- Base URL: `/api/v1/`
- All endpoints are prefixed with the version

## 📊 Performance Considerations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: All list endpoints support pagination
- **Image Optimization**: Automatic image compression and resizing
- **Caching**: Implement Redis for caching (future enhancement)
- **Rate Limiting**: Built-in protection against abuse

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Order management system
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Mobile push notifications
- [ ] Advanced search filters
- [ ] Social media integration
- [ ] Multi-language support 