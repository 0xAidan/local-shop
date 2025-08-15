# LocalShop - Local Marketplace App

A React Native app that connects local sellers with nearby customers, inspired by Gametime and the Shop app. Sellers can create their own shops and sell products locally, while buyers can discover and purchase from shops in their area.

## Features

- **Dark Theme UI** - Modern, sleek interface with dark colors
- **Location-Based Discovery** - Only shows shops within your local area
- **Shop Categories** - Organized browsing by trending, recommendations, and categories
- **Pickup-Only Model** - No shipping, local pickup only
- **Seller Shops** - Individual sellers can create branded shop pages

## Project Structure

```
LocalShop/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ShopCard.tsx     # Shop display card component
│   ├── screens/             # App screens (to be added)
│   ├── navigation/          # Navigation setup (to be added)
│   ├── services/            # Data and API services
│   │   └── mockData.ts      # Mock data for development
│   └── types/               # TypeScript type definitions
│       └── index.ts         # App data types
├── App.tsx                  # Main app component
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional but recommended)
- iOS Simulator (for iOS development) or Android Emulator

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

4. **Run on Android:**
   ```bash
   npm run android
   ```

5. **Run on Web (for testing):**
   ```bash
   npm run web
   ```

## Current Features

### Main Screen
- **Location Header** - Shows current city (Thunder Bay)
- **User Profile** - Username and avatar placeholder
- **Shop Categories** - Organized sections:
  - Trending shops
  - Personalized recommendations
  - Meat & Produce
  - Goods (handmade items)

### Shop Cards
- Shop name and category
- Star rating display
- Distance from user
- Touchable for future navigation

## Mock Data

The app currently uses mock data to simulate:
- 8 different local shops
- Various categories (Produce, Bakery, Handmade, etc.)
- Shop ratings and distances
- User information

## Next Steps

1. **Add Navigation** - Set up React Navigation for multiple screens
2. **Shop Detail Screen** - Individual shop pages with products
3. **Product Browsing** - View and search products within shops
4. **User Authentication** - Login/signup functionality
5. **Location Services** - Real GPS location detection
6. **Backend Integration** - Replace mock data with real API calls

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and tools
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation (to be added)
- **Expo Linear Gradient** - UI styling effects

## Development Notes

- The app uses a dark theme throughout
- All shop cards are currently placeholder data
- Location is hardcoded to "Thunder Bay" for now
- No backend integration yet - all data is mock

## Contributing

This is a learning project. Feel free to experiment and add features!

## License

This project is for educational purposes. 