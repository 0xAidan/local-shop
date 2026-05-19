# LocalShop — Store readiness setup

This guide lists what is implemented in code and **what you must do manually** (accounts, keys, App Store).

## What was implemented (code)

- **Backend:** Real order pricing, pending payments, Stripe PaymentIntent + webhooks, Connect onboarding routes, admin API, rate limiting, CORS env, notification fix, shop ownership fix
- **Mobile:** Auth re-enabled, env-based API URL, real products/orders/shops (no mocks), checkout → payment intent, account deletion, legal links, EAS/app store config files
- **Admin:** New Next.js app at `admin/` (platform dashboard)

## Your step-in checklist (required)

### 1. Accounts to create (one-time)

| Service | Why | Link |
|---------|-----|------|
| **Apple Developer** | iOS App Store + TestFlight | https://developer.apple.com |
| **Google Play Console** | Android (after iOS) | https://play.google.com/console |
| **Expo** | Mobile builds (EAS) | https://expo.dev |
| **MongoDB Atlas** | Production database | https://www.mongodb.com/atlas |
| **Railway or Render** | Host Node API | https://railway.app or https://render.com |
| **Stripe** | Payments + Connect for shops | https://dashboard.stripe.com |
| **Vercel** | Host `admin/` app | https://vercel.com |
| **Cloudinary** | Images (if not already) | https://cloudinary.com |

### 2. Backend environment

Copy and fill in:

```bash
cp backend/env.example backend/.env
```

Minimum for local dev:

- `MONGODB_URI`
- `JWT_SECRET`
- `STRIPE_SKIP_PAYMENTS=true` (until Stripe keys are ready)

For production add:

- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `CORS_ORIGINS`, `ADMIN_WEB_URL`
- Strong `JWT_SECRET`

Create admin user:

```bash
cd backend
node scripts/create-admin.js you@email.com YourSecurePassword
```

### 3. Stripe (when ready for real payments)

1. Enable **Connect** in Stripe Dashboard  
2. Add webhook endpoint: `https://YOUR-API-DOMAIN/api/webhooks/stripe`  
   Events: `payment_intent.succeeded`, `payment_intent.payment_failed`  
3. Set `STRIPE_WEBHOOK_SECRET` in backend `.env`  
4. Remove or set `STRIPE_SKIP_PAYMENTS=false` in production  

### 4. Mobile app environment

```bash
cp LocalShop/.env.example LocalShop/.env
```

- Use your computer’s LAN IP for `EXPO_PUBLIC_API_URL` when testing on a phone, e.g. `http://192.168.1.10:3001/api`
- Use `https://your-api.railway.app/api` in production builds

### 5. Expo / iOS build (you must run these)

```bash
cd LocalShop
npm install
npx expo login
eas init   # creates real project ID — update app.json extra.eas.projectId
eas build --platform ios --profile preview
```

Update `eas.json` with your Apple ID and App Store Connect app ID before submit.

### 6. Admin panel

```bash
cd admin
npm install
cp .env.example .env.local   # create with NEXT_PUBLIC_API_URL
npm run dev
```

Open http://localhost:3002 and sign in with the **admin** user you created.

### 7. Legal pages (App Store requirement)

Host real pages and set URLs in mobile `.env`:

- Privacy policy  
- Terms of service  
- Support email  

Apple will reject the app without working privacy policy + account deletion (deletion is implemented in Profile).

### 8. Privacy policy hosting

Until you have a marketing site, use Notion/Google Doc public URL or a simple Vercel page — then set `EXPO_PUBLIC_PRIVACY_URL` and `EXPO_PUBLIC_TERMS_URL`.

## Local dev quick start

```bash
# Terminal 1 — API
cd backend && npm install && npm run dev

# Terminal 2 — mobile
cd LocalShop && npm install && npx expo start

# Terminal 3 — admin (optional)
cd admin && npm install && npm run dev
```

Register a customer in the app, register a shop owner, create a shop, add products, checkout (with `STRIPE_SKIP_PAYMENTS=true` orders auto-complete).

## Still TODO after this PR (not automated)

- [ ] Native Stripe Payment Sheet in app (needs dev build + `@stripe/stripe-react-native`)
- [ ] Push notifications
- [ ] Full admin: user ban, dispute resolution UI, Connect payout approvals
- [ ] Merchant web portal (replace legacy `shop-dashboard/`)
- [ ] App Store screenshots, metadata, TestFlight beta
- [ ] Automated E2E tests (Maestro)
- [ ] Production deploy scripts / CI

## When to ping for help

Message when you have: Stripe keys, Expo project ID, API production URL, and Apple Developer account — we can wire TestFlight and final payment testing.
