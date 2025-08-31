# Development Mode Setup

## Current Status 🚀

The app is now running in **Development Mode** with authentication bypassed for faster development and testing.

### What's Working:
- ✅ Backend API running on port 3001
- ✅ MongoDB connected
- ✅ Mobile app starting without errors
- ✅ Role switching between Customer and Shop Owner views
- ✅ No login required for testing

### What's Disabled:
- ❌ User authentication/login
- ❌ API token validation
- ❌ User registration
- ❌ Session management

## How to Use 🎯

### Switching Between Views:
1. **Customer View**: Browse shops, view products, use cart
2. **Shop Owner View**: Manage shops, create products, view dashboard
3. **Role Switcher**: Tap the role switcher button in the header to switch views

### Development Workflow:
1. Make changes to components
2. Test in both customer and shop owner modes
3. Switch roles using the header button
4. No need to log in/out during development

## Re-enabling Authentication 🔐

When you're ready to re-enable authentication (after MVP is complete):

### 1. Update AuthContext.tsx:
```typescript
// Comment out these lines:
// const [user, setUser] = useState<User | null>({...});
// const [isAuthenticated, setIsAuthenticated] = useState(true);

// Uncomment these lines:
const [user, setUser] = useState<User | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);

// Uncomment useEffect:
useEffect(() => {
  checkAuthentication();
}, []);

// Restore checkAuthentication function:
const checkAuthentication = async () => {
  try {
    if (apiService.isAuthenticated()) {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      setCurrentViewMode(userData.role || 'customer');
    }
  } catch (error) {
    console.log('User not authenticated');
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Remove RoleSwitcher:
- Delete `src/components/RoleSwitcher.tsx`
- Remove import and usage from `HomeHeader.tsx`
- Remove from `AuthContext.tsx`

### 3. Restore canSwitchToShopOwner:
```typescript
const canSwitchToShopOwner = (): boolean => {
  return user?.role === 'shop_owner';
};
```

### 4. Update AppNavigator:
- The navigation logic is already set up to handle authentication
- Just uncomment the authentication check in AuthContext

## Current App Structure 📱

```
App.tsx
├── AuthProvider (Development Mode)
├── CartProvider
└── AppNavigator
    ├── CustomerTabs (Home, Map, Cart, Profile)
    └── ShopOwnerTabs (Dashboard, MyShops, Products, Profile)
```

## Testing Checklist ✅

- [ ] App starts without errors
- [ ] Can switch between customer and shop owner views
- [ ] Customer view shows shops and products
- [ ] Shop owner view shows dashboard and management tools
- [ ] Navigation works in both modes
- [ ] No authentication errors in console

## Notes 📝

- The backend is still fully functional
- All API endpoints work (just no auth required)
- You can test the complete user flow without login
- Remember to re-enable authentication before production!

---

**Happy developing! 🎉** 