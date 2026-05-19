# LocalShop — Store readiness setup

## Implemented in code (current branch)

- **Backend:** Server-side order pricing, pending payments, Stripe PaymentIntent + webhooks, Connect onboarding, admin API, rate limiting, CORS, notification/shop fixes
- **Mobile:** Real auth, env API URL, real products/orders/shops, Stripe Payment Sheet (dev builds), order confirmation screen, account deletion, legal links, EAS config, rebuilt home UI
- **Admin:** Next.js app at `admin/`
- **CI:** GitHub Actions (backend tests + admin build)
- **Legal:** Starter pages in `legal/privacy.html` and `legal/terms.html` (host these and set URLs in `.env`)
- **Maestro:** Starter flow in `maestro/flows/smoke.yaml`

## Your step-in checklist (required)

### 1. Accounts (one-time)

| Service | Why |
|---------|-----|
| [Apple Developer](https://developer.apple.com) | iOS App Store + TestFlight |
| [Google Play Console](https://play.google.com/console) | Android |
| [Expo](https://expo.dev) | EAS builds |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Production database |
| [Railway](https://railway.app) or [Render](https://render.com) | Host API |
| [Stripe](https://dashboard.stripe.com) | Payments + Connect |
| [Vercel](https://vercel.com) | Host `admin/` + legal pages |

### 2. Backend `.env`

```bash
cp backend/env.example backend/.env
```

Local dev minimum: `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SKIP_PAYMENTS=true`

Production: add `STRIPE_*`, `CORS_ORIGINS`, `ADMIN_WEB_URL`, strong `JWT_SECRET`

Create admin user:

```bash
cd backend && node scripts/create-admin.js you@email.com YourSecurePassword
```

### 3. Mobile `.env`

```bash
cp LocalShop/.env.example LocalShop/.env
```

- Phone testing: `EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:3001/api`
- Production build: `https://your-api.example.com/api`
- Host `legal/*.html` and set `EXPO_PUBLIC_PRIVACY_URL` / `EXPO_PUBLIC_TERMS_URL`

### 4. Payments

| Mode | What you need |
|------|----------------|
| **Expo Go (simulator)** | `STRIPE_SKIP_PAYMENTS=true` on backend — orders auto-complete |
| **Real card testing** | EAS development build + Stripe test keys + Payment Sheet |

```bash
cd LocalShop
npx expo login
eas init   # updates project ID in app.json
eas build --platform ios --profile development
```

### 5. Stripe webhooks (production)

Endpoint: `https://YOUR-API/api/webhooks/stripe`  
Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 6. App Store submit

Update `eas.json` with Apple ID and App Store Connect app ID, then:

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### 7. Admin panel

```bash
cd admin && npm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```

## Local dev (three terminals)

```bash
cd backend && npm run dev
cd LocalShop && npx expo start --localhost
cd admin && npm run dev
```

## Still manual / post-v1

- [ ] Production deploy (API + DB + env secrets)
- [ ] Host legal pages on a public HTTPS URL
- [ ] App Store screenshots and metadata
- [ ] Push notifications
- [ ] Merchant web portal (replace legacy `shop-dashboard/`)
- [ ] Full admin: disputes, payout approvals
- [ ] Expand Maestro E2E with test user credentials

## When to ask for help

When you have: Stripe keys, Expo project ID, production API URL, and Apple Developer account — wire TestFlight and live payment testing.
