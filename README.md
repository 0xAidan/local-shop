# Local Shop - Complete Platform

A comprehensive local shop discovery and management platform with a React Native mobile app and a full-featured backend API. This project helps local businesses connect with customers in their area.

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

Before you start, make sure you have these installed on your computer:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (local or cloud) - [Download here](https://www.mongodb.com/try/download/community)
- **Expo CLI** (for mobile development) - Install with: `npm install -g expo-cli`
- **Git** - [Download here](https://git-scm.com/)

You'll also need accounts for:
- **Google Maps API** - [Get API key here](https://developers.google.com/maps/documentation/javascript/get-api-key)
- **Cloudinary** - [Sign up here](https://cloudinary.com/)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd local-shop
```

### 2. Set Up the Backend
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/local-shop
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

Start the backend server:
```bash
npm start
```

### 3. Set Up the Mobile App
```bash
cd LocalShop
npm install
```

Start the Expo development server:
```bash
npm start
```

### 4. Set Up the Web Dashboard
The web dashboard is ready to use! Just open the files in your browser:
```bash
cd shop-dashboard
# Open index.html in your browser
```

## 📱 Running the Mobile App

1. Install the **Expo Go** app on your phone from the App Store or Google Play
2. Make sure your phone and computer are on the same WiFi network
3. Run `npm start` in the LocalShop directory
4. Scan the QR code with your phone's camera (iOS) or the Expo Go app (Android)

## 🔧 Development Tips

### For Beginners:
- Start with the **backend** - it's the foundation of everything
- Use **Postman** or **Insomnia** to test your API endpoints
- Check the **console logs** in your terminal for debugging
- Don't worry if something breaks - that's how you learn!

### Common Issues:
- **Port already in use**: Change the PORT in your .env file
- **MongoDB connection error**: Make sure MongoDB is running
- **Expo app not loading**: Check your WiFi connection and try restarting Expo

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test everything works
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Need Help?

If you're stuck or have questions:
1. Check the console for error messages
2. Look at the existing code for examples
3. Search online for similar issues
4. Don't hesitate to ask for help!

---

**Happy coding! 🎉** 