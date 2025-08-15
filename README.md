# Local Shop - Complete Platform

A comprehensive local shop discovery and management platform with a React Native mobile app and a full-featured backend API.

## 🏗️ Project Structure

```
local-shop/
├── LocalShop/                 # React Native mobile app
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API services
│   │   └── types/           # TypeScript definitions
│   └── package.json
├── backend/                  # Node.js/Express API
│   ├── src/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── README.md
└── shop-dashboard/          # Web dashboard for shop owners
    ├── index.html           # Dashboard interface
    ├── login.html           # Login page
    ├── dashboard.js         # Dashboard functionality
    └── login.js            # Login functionality
```

## 🚀 Features

### Mobile App (React Native)
- **Shop Discovery**: Browse local shops by category and location
- **Product Catalog**: View detailed product information with pricing
- **Location Services**: Find shops near you with distance calculations
- **User Authentication**: Secure login and registration
- **Favorites**: Save and manage favorite shops
- **Reviews & Ratings**: Rate and review shops and products
- **Modern UI**: Beautiful, intuitive interface

### Backend API (Node.js/Express)
- **Shop Management**: Complete CRUD operations for shops
- **Product Management**: Detailed product catalog with inventory
- **User Authentication**: JWT-based authentication system
- **Location Services**: Geocoding and distance calculations
- **Image Upload**: Cloudinary integration for media management
- **Search & Filtering**: Advanced search with multiple filters
- **Security**: Input validation, rate limiting, and CORS protection

### Web Dashboard (HTML/CSS/JavaScript)
- **Shop Owner Portal**: Dedicated interface for shop management
- **Product Management**: Add, edit, and manage products
- **Inventory Tracking**: Real-time stock management
- **Analytics**: Basic shop statistics and insights
- **Profile Management**: Update shop and personal information

## 🛠️ Tech Stack

### Mobile App
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **React Navigation** - Navigation management
- **TypeScript** - Type safety and better development experience

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Google Maps API** - Geocoding services

### Web Dashboard
- **HTML5** - Structure
- **CSS3** - Styling with Bootstrap
- **JavaScript (ES6+)** - Functionality
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Expo CLI** (for mobile development)
- **Google Maps API key**
- **Cloudinary account**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd local-shop
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Mobile App Setup
```bash
cd LocalShop

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Web Dashboard Setup
```bash
cd shop-dashboard

# Open in browser (requires backend to be running)
# Navigate to http://localhost:3001/shop-dashboard/
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:

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

### Mobile App Configuration
Update the API base URL in your mobile app to point to your backend:

```typescript
// In your API service file
const API_BASE_URL = 'http://localhost:3001/api';
```

## 📱 Mobile App Features

### Screens
- **Home**: Discover local shops and featured products
- **Shop Detail**: View shop information, products, and reviews
- **Product Detail**: Detailed product information with images
- **Profile**: User profile and preferences
- **Favorites**: Saved shops and products

### Key Components
- **ShopCard**: Displays shop information with rating and distance
- **ProductCard**: Shows product details with pricing
- **MapView**: Interactive map with shop locations
- **SearchBar**: Search shops and products

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Shops
- `GET /api/shops` - Get all shops (with filters)
- `GET /api/shops/:id` - Get shop by ID
- `POST /api/shops` - Create new shop
- `PUT /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/shops` - Get user's shops
- `GET /api/users/favorites` - Get user's favorites

## 💻 Web Dashboard Features

### Dashboard Overview
- **Statistics**: Total shops, products, ratings, revenue
- **Recent Activity**: Latest updates and actions
- **Quick Actions**: Fast access to common tasks

### Shop Management
- **Create Shops**: Add new shops with location and details
- **Edit Shops**: Update shop information and settings
- **Shop List**: View all owned shops with status

### Product Management
- **Add Products**: Create products with detailed information
- **Inventory Tracking**: Monitor stock levels and alerts
- **Product Catalog**: Manage all products in a table view

### Profile Settings
- **Personal Information**: Update name, email, phone
- **Password Management**: Change account password
- **Preferences**: Set notification and dietary preferences

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Express-validator for request validation
- **CORS Protection**: Configurable cross-origin settings
- **Rate Limiting**: Protection against abuse
- **Helmet**: Security headers middleware

## 📊 Database Schema

### Shop Model
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
  contact: { phone: String, email: String, website: String },
  hours: Object,
  images: Array,
  owner: ObjectId,
  rating: { average: Number, count: Number },
  features: Array
}
```

### Product Model
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

### User Model
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

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Mobile App Testing
```bash
cd LocalShop
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up production environment variables
2. Configure MongoDB Atlas or production database
3. Set up Cloudinary for image storage
4. Deploy to Heroku, AWS, or your preferred platform

### Mobile App Deployment
1. Build the app using Expo
2. Submit to App Store and Google Play Store
3. Configure production API endpoints

### Web Dashboard Deployment
1. Host static files on CDN or web server
2. Update API endpoints to production URLs
3. Configure CORS settings

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
- Check the documentation
- Review the API documentation

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Order management system
- [ ] Payment integration (Stripe)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Delivery tracking
- [ ] Loyalty program
- [ ] Advanced search filters

## 📞 Contact

For questions or support, please contact the development team or create an issue in the repository.

---

**Note**: This is a comprehensive demo project. For production use, please ensure proper security measures, error handling, and testing are implemented. 