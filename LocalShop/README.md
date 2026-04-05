# 🏪 Local Shop - Complete Mobile App

A comprehensive React Native app that allows both customers to discover local shops and shop owners to manage their businesses - all in one unified mobile experience!

## ✨ Features

### For Customers:
- **Discover Local Shops**: Browse shops by category, location, and features
- **Shop Details**: View shop information, hours, contact details, and products
- **Product Browsing**: See detailed product information, pricing, and availability
- **Favorites**: Save your favorite shops for quick access
- **User Profiles**: Manage your preferences and account settings

### For Shop Owners:
- **Complete Shop Management**: Create and manage multiple shops
- **Product Management**: Add, edit, and manage inventory for all products
- **Dashboard**: View statistics and manage your business
- **Rich Product Details**: Add dietary information, allergens, origin, and more
- **Inventory Tracking**: Monitor stock levels and set alerts
- **Business Hours**: Set detailed operating hours for each day

## 🏗️ Architecture

### Frontend (React Native/Expo)
- **Authentication System**: Login/registration with role-based access
- **Navigation**: Separate flows for customers and shop owners
- **API Integration**: Full backend communication
- **Form Management**: Comprehensive forms with validation
- **UI/UX**: Beautiful, modern interface with gradients and animations

### Backend (Node.js/Express)
- **RESTful API**: Complete CRUD operations for all entities
- **Authentication**: JWT-based authentication with role management
- **Database**: MongoDB with Mongoose ODM
- **Image Upload**: Cloudinary integration for media management
- **Geocoding**: Google Maps integration for location services
- **Security**: Input validation, rate limiting, and security headers

## 📱 App Structure

```
LocalShop/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── LoginScreen.tsx           # Authentication
│   │   ├── ShopOwnerDashboard.tsx    # Shop owner main dashboard
│   │   ├── CreateShopScreen.tsx      # Shop creation form
│   │   ├── CreateProductScreen.tsx   # Product creation form
│   │   ├── HomeScreen.tsx            # Customer home screen
│   │   └── ShopDetailScreen.tsx      # Shop details view
│   ├── services/           # API and business logic
│   │   └── api.ts                    # Complete API service
│   └── types/              # TypeScript type definitions
└── backend/                # Backend API (separate directory)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Expo CLI
- Google Maps API key
- Cloudinary account

### 1. Set up the Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 2. Set up the Mobile App
```bash
cd LocalShop
npm install
```

The API base URL comes from **`app.config.js`** → `extra.apiBaseUrl`. Override with environment variables:

```bash
# Same machine / iOS simulator (backend on host)
export EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3001/api

# Physical device on LAN (use your computer's LAN IP)
export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.10:3001/api

# Stripe (use EAS secrets for production builds)
export EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
export EXPO_PUBLIC_STRIPE_MERCHANT_ID=merchant.com.yourapp   # iOS Apple Pay

npm start
```

**Stripe checkout** needs a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`expo-dev-client`), not Expo Go alone. Run `eas build --profile development` after configuring `eas.json`.

**Store submission:** Set `IOS_BUNDLE_ID` / `ANDROID_PACKAGE` env vars when building if you change identifiers from the defaults in `app.config.js`. Host **Privacy Policy** and **Terms** URLs in App Store Connect / Play Console (add in-app links in Profile or Settings as needed).

### 3. Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🎯 User Flows

### Customer Flow:
1. **Register/Login** → Create account or sign in
2. **Browse Shops** → Discover local businesses
3. **View Shop Details** → See products, hours, location
4. **Add to Favorites** → Save shops for later
5. **Manage Profile** → Update preferences and settings

### Shop Owner Flow:
1. **Register as Shop Owner** → Create business account
2. **Create Shop** → Add shop details, location, hours
3. **Add Products** → Create product catalog with details
4. **Manage Inventory** → Track stock levels and availability
5. **View Dashboard** → Monitor business performance

## 🔧 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (customer/shop_owner/admin)
- Secure password hashing
- Token management

### Shop Management
- Complete shop profiles with location, hours, contact info
- Multiple shops per owner
- Shop categories and features
- Image upload support

### Product Management
- Rich product details (name, description, pricing)
- Inventory tracking with low stock alerts
- Dietary information and allergens
- Product categories and tags
- Origin and local sourcing info

### Location Services
- Address geocoding to coordinates
- Distance calculations
- Location-based shop discovery

### Image Management
- Cloudinary integration
- Multiple image upload
- Image optimization and storage

## 📊 Database Schema

### Users
- Authentication info (email, password)
- Profile data (name, phone, avatar)
- Role-based permissions
- Preferences and settings

### Shops
- Basic info (name, description, category)
- Location (address, coordinates, city/state/zip)
- Contact information
- Business hours
- Features and tags
- Owner relationship

### Products
- Basic info (name, description, category)
- Pricing (current price, original price)
- Inventory (quantity, unit, thresholds)
- Dietary information
- Allergens and origin
- Shop relationship

## 🔒 Security Features

- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers (Helmet)
- Password hashing (bcrypt)
- JWT token management
- Role-based access control

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Gradient Backgrounds**: Beautiful visual appeal
- **Responsive Forms**: Comprehensive input validation
- **Loading States**: User feedback during operations
- **Error Handling**: Clear error messages
- **Navigation**: Smooth transitions between screens

## 🚀 Deployment

### Backend Deployment
- Deploy to Heroku, Railway, or any Node.js hosting
- Set up MongoDB Atlas for database
- Configure environment variables
- Set up domain and SSL

### Mobile App Deployment
- Build with Expo EAS Build
- Deploy to App Store and Google Play
- Configure app signing
- Set up push notifications

## 🔮 Future Enhancements

- **Real-time Notifications**: Push notifications for orders and updates
- **Payment Integration**: Stripe/PayPal for transactions
- **Order Management**: Complete order lifecycle
- **Reviews & Ratings**: Customer feedback system
- **Analytics Dashboard**: Business insights and reports
- **Multi-language Support**: Internationalization
- **Offline Support**: Offline-first architecture
- **Social Features**: Sharing and social integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for local businesses and communities** 