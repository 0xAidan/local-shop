# LocalShop — Store readiness setup

## Implemented in code (current branch)

- **Backend:** Server-side order pricing, pending payments, Stripe PaymentIntent + webhooks (with dedup), Connect onboarding, admin API, payment-gated fulfillment, inventory on payment success, Stripe refunds, rate limiting, CORS, trust proxy
- **Mobile:** Real auth, env API URL, Stripe Payment Sheet (dev builds), Connect onboarding screen, profile save, cross-platform account deletion, shop toggle/delete, order confirmation, legal links, EAS env profiles
- **Admin:** Next.js dashboard with users, shops moderation, disputes (read-only)
- **CI:** Backend tests, admin build, mobile TypeScript check
- **Deploy templates:** `backend/Dockerfile`, `render.yaml`, `admin/vercel.json`, `legal/vercel.json`
- **Legal:** Starter pages in `legal/privacy.html` and `legal/terms.html`
- **Maestro:** Starter flow in `maestro/flows/smoke.yaml`

---

## Local dev (three terminals)

```bash
cd backend && npm run dev
cd LocalShop && npm start
cd admin && npm run dev
```

Local backend minimum in `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/local-shop
JWT_SECRET=your-dev-secret
STRIPE_SKIP_PAYMENTS=true
```

---

## Live services (verified)

| Service | URL |
|---------|-----|
| API (Render) | `https://local-shop-v93b.onrender.com` |
| API base path | `https://local-shop-v93b.onrender.com/api` |
| Health check | `https://local-shop-v93b.onrender.com/health` |
| Stripe webhook | `https://local-shop-v93b.onrender.com/api/webhooks/stripe` |
| Legal (Vercel) | `https://local-shop-sigma.vercel.app` |
| Privacy | `https://local-shop-sigma.vercel.app/privacy` |
| Terms | `https://local-shop-sigma.vercel.app/terms` |
| Admin (Vercel) | _Deploy per section below — set `ADMIN_WEB_URL` on Render after_ |

---

## M1 — Staging API + hosted legal

### 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and allow network access (`0.0.0.0/0` for Render/Railway)
3. Copy connection string → `MONGODB_URI`

### 2. Deploy API to Render

1. Push this repo to GitHub
2. In [Render](https://render.com), **New → Blueprint** and connect the repo (uses [`render.yaml`](render.yaml))
3. Set secret env vars in the Render dashboard (never commit these):

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | 64-char random string |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `CORS_ORIGINS` | `https://admin.yourdomain.com` |
| `ADMIN_WEB_URL` | `https://admin.yourdomain.com` |
| `STRIPE_CONNECT_REFRESH_URL` | `localshop://connect/refresh` (mobile deep link) |
| `STRIPE_CONNECT_RETURN_URL` | `localshop://connect/return` (mobile deep link) |
| `CLOUDINARY_*` | From Cloudinary dashboard |
| `GOOGLE_MAPS_API_KEY` | From Google Cloud |

4. Verify: `curl https://local-shop-v93b.onrender.com/health`

**Alternative:** Railway — connect repo, set root to `backend/`, use [`backend/Dockerfile`](backend/Dockerfile), add same env vars.

### 3. Host legal pages on Vercel

```bash
cd legal
npx vercel --prod
```

**Live URL:** `https://local-shop-sigma.vercel.app`. Pages:
- `/privacy` → privacy policy
- `/terms` → terms of service

### 4. Host admin on Vercel

```bash
cd admin
# Set in Vercel project settings:
# NEXT_PUBLIC_API_URL=https://local-shop-v93b.onrender.com/api
npx vercel --prod
```

Set the Vercel project **root directory** to `admin` (not repo root). After deploy, set on Render:
- `ADMIN_WEB_URL` → your admin Vercel URL
- `CORS_ORIGINS` → same admin URL (comma-separate if you add more origins)
- `STRIPE_CONNECT_REFRESH_URL` → `localshop://connect/refresh`
- `STRIPE_CONNECT_RETURN_URL` → `localshop://connect/return`

### 5. Create admin user on staging DB

```bash
cd backend
MONGODB_URI="your-atlas-uri" node scripts/create-admin.js you@email.com YourSecurePassword
```

### 6. Update mobile `.env` for device testing

```env
EXPO_PUBLIC_API_URL=https://local-shop-v93b.onrender.com/api
EXPO_PUBLIC_PRIVACY_URL=https://local-shop-sigma.vercel.app/privacy
EXPO_PUBLIC_TERMS_URL=https://local-shop-sigma.vercel.app/terms
EXPO_PUBLIC_SUPPORT_URL=mailto:support@localshop.app
```

For local dev, keep `EXPO_PUBLIC_API_URL=http://localhost:3001/api` in `.env` (see `.env.example`).

---

## M2 — EAS dev build + Stripe test checkout

### 1. Stripe dashboard

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Developers → API keys → copy test keys
2. Enable **Connect** (Express accounts)
3. Webhooks → Add endpoint:
   - URL: `https://local-shop-v93b.onrender.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`
4. Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Render

### 2. Turn off payment bypass on staging

On Render, set `STRIPE_SKIP_PAYMENTS=false` (or remove the variable).

### 3. Expo / EAS

```bash
cd LocalShop
npx expo login
eas init                    # links Expo project (see app.json extra.eas.projectId)
```

**Linked project:** `@aidannuge/localshop` on [expo.dev](https://expo.dev/accounts/aidannuge/projects/localshop).

Set EAS secrets (preferred over committing keys):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://local-shop-v93b.onrender.com/api
eas secret:create --scope project --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value pk_test_...
eas secret:create --scope project --name EXPO_PUBLIC_PRIVACY_URL --value https://local-shop-sigma.vercel.app/privacy
eas secret:create --scope project --name EXPO_PUBLIC_TERMS_URL --value https://local-shop-sigma.vercel.app/terms
```

Production URLs are already set in [`LocalShop/eas.json`](LocalShop/eas.json) `build.*.env` sections. EAS secrets override at build time when set.

Build and install:

```bash
# Simulator-only build:
eas build --platform ios --profile development

# Physical iPhone (internal distribution):
eas build --platform ios --profile preview
```

Install via the QR link on the [Expo builds page](https://expo.dev/accounts/aidannuge/projects/localshop/builds).

**Plain-language checklist:** [`docs/APP_STORE_NEXT_STEPS.md`](docs/APP_STORE_NEXT_STEPS.md)

### 4. Test card checkout

Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.

### 5. Test Stripe webhooks locally (optional)

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Copy whsec_... to backend/.env STRIPE_WEBHOOK_SECRET
stripe trigger payment_intent.succeeded
```

---

## M5 — TestFlight + App Store submit

### Prerequisites checklist

- [ ] Apple Developer Program ($99/yr)
- [ ] App Store Connect app created with bundle ID `com.localshop.app`
- [ ] Replace placeholder app icon (`LocalShop/assets/icon.png`)
- [ ] Staging checkout tested on physical device
- [ ] Account deletion tested (Profile → Delete Account)
- [ ] Privacy/Terms links open in Safari

### App Store Connect metadata

- Screenshots (6.7" and 6.5" iPhone)
- Description, keywords, support URL
- Privacy nutrition labels (match [`legal/privacy.html`](legal/privacy.html))
- Export compliance: app uses standard encryption only (`ITSAppUsesNonExemptEncryption: false`)

### Submit

Update [`LocalShop/eas.json`](LocalShop/eas.json):

```json
"appleId": "you@email.com",
"ascAppId": "1234567890"
```

```bash
cd LocalShop
eas build --platform ios --profile production
eas submit --platform ios
```

Add internal testers in App Store Connect → TestFlight.

### Android (parallel, lower polish OK)

```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Environment variable reference

### `backend/.env`

```env
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/localshop
JWT_SECRET=<64-char-random>
CORS_ORIGINS=https://admin.yourdomain.com
ADMIN_WEB_URL=https://admin.yourdomain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_COUNTRY=CA
STRIPE_CONNECT_REFRESH_URL=localshop://connect/refresh
STRIPE_CONNECT_RETURN_URL=localshop://connect/return
STRIPE_SKIP_PAYMENTS=false
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_MAPS_API_KEY=...
```

### `LocalShop/.env`

```env
EXPO_PUBLIC_API_URL=https://local-shop-v93b.onrender.com/api
EXPO_PUBLIC_PRIVACY_URL=https://local-shop-sigma.vercel.app/privacy
EXPO_PUBLIC_TERMS_URL=https://local-shop-sigma.vercel.app/terms
EXPO_PUBLIC_SUPPORT_URL=mailto:support@yourdomain.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_CONNECT_RETURN_URL=localshop://connect/return
EXPO_PUBLIC_CONNECT_REFRESH_URL=localshop://connect/refresh
```

### `admin/.env.local`

```env
NEXT_PUBLIC_API_URL=https://local-shop-v93b.onrender.com/api
```

---

## Verification commands

```bash
cd backend && npm test
cd admin && npm run build
cd LocalShop && npx tsc --noEmit
```

---

## Post-v1 (deferred)

- Push notifications
- Merchant web portal (replace legacy `shop-dashboard/`)
- Admin payout approvals
- Full review/dispute workflow in mobile
- Expanded Maestro E2E with test credentials
