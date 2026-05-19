# Finish the app end-to-end (no Apple account needed)

Goal: browse shops → add to cart → pay with Stripe test card → shop owner fulfills order → admin can moderate. TestFlight comes later.

## What you need

| Tool | Why |
|------|-----|
| Expo account | You have `@aidannuge` |
| iOS Simulator (Xcode) | Test the app on your Mac |
| **EAS development build** | Stripe payments do **not** work in Expo Go |
| Render API | Already live |
| Vercel legal pages | Already live |

## Step 1 — Merge the latest PR

Merge the open GitHub PR so `eas.json`, fixes, and docs are on the main branch. Render will redeploy the API after merge (if connected to that branch).

## Step 2 — Seed demo shops on the live database

On your machine (uses `backend/.env` MongoDB URI — same cluster as Render):

```bash
cd backend
npm run seed:catalog
```

This adds sample shops and products **without deleting users**. Demo shop owner:

- Email: `owner@test.com`
- Password: `password123`

Verify in a browser: https://local-shop-v93b.onrender.com/api/shops

## Step 3 — Build the app for the simulator (Stripe works here)

Expo Go cannot run card payments. Use a development build:

```bash
cd LocalShop
eas build --platform ios --profile development
```

When the build finishes, open the link in the [Expo dashboard](https://expo.dev/accounts/aidannuge/projects/localshop/builds) and install on the **iOS Simulator**.

## Step 4 — Run the simulator build

1. Start Metro: `cd LocalShop && npm start`
2. Open the **development build** app (not Expo Go).
3. Sign up as a **customer** or log in.
4. Browse shops → add items → checkout.
5. Test card: `4242 4242 4242 4242`, any future expiry, any CVC.
6. Profile → Privacy / Terms should open Vercel pages.

## Step 5 — Test shop owner flow

1. Log out → register as **Shop owner** (toggle on sign-up).
2. Or log in as `owner@test.com` / `password123`.
3. My Shops → manage orders for seeded shops.
4. Optional: create a new shop (needs Cloudinary env vars on Render for photo upload).

## Step 6 — Admin dashboard (optional but recommended)

Deploy `admin/` to Vercel (root directory `admin`, env `NEXT_PUBLIC_API_URL=https://local-shop-v93b.onrender.com/api`).

Log in with `admin@localshop.app` (password from your setup notes).

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No shops in app | Run `npm run seed:catalog` in `backend/` |
| Checkout says “development build” | You are in Expo Go — use the EAS simulator build |
| API slow first request | Render free tier waking up (~30–60s) |
| Order won’t confirm for owner | Payment must succeed; check Stripe webhook on Render |
| Upload shop image fails | Add `CLOUDINARY_*` keys on Render |

## After E2E works

When the full loop works on the simulator, you can enroll in Apple Developer for TestFlight. See `SETUP.md` M5.
