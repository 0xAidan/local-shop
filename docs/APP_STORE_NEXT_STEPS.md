# Local Shop — Your next steps (plain language)

This is the short checklist after the agent finishes automated setup. Full details are in [`SETUP.md`](../SETUP.md).

## What is already live

| What | URL |
|------|-----|
| Mobile API | https://local-shop-v93b.onrender.com |
| Privacy policy | https://local-shop-sigma.vercel.app/privacy |
| Terms of service | https://local-shop-sigma.vercel.app/terms |
| Expo project (EAS) | https://expo.dev/accounts/aidannuge/projects/localshop |

## 1. Merge the open PR

Review and merge the GitHub PR that updates `eas.json`, `SETUP.md`, and links the Expo project.

## 2. Deploy the admin dashboard (about 10 minutes)

The admin site lets you moderate shops and users. It is **not** deployed yet.

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `0xAidan/local-shop`.
2. Set **Root Directory** to `admin` (important).
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://local-shop-v93b.onrender.com/api`
4. Deploy. Copy the URL (example: `https://local-shop-admin.vercel.app`).
5. In [Render](https://dashboard.render.com) → your API service → **Environment**:
   - `ADMIN_WEB_URL` = your admin Vercel URL
   - `CORS_ORIGINS` = same URL
   - `STRIPE_CONNECT_REFRESH_URL` = `localshop://connect/refresh`
   - `STRIPE_CONNECT_RETURN_URL` = `localshop://connect/return`
   - Remove `STRIPE_SKIP_PAYMENTS` or set it to `false` for real test payments
6. Log in at the admin URL with the credentials the agent gave you (or run `create-admin.js` yourself).

## 3. Test the app on your computer

```bash
cd LocalShop && npm start
```

In the iOS simulator:

- Sign up / log in
- Open Profile → Privacy and Terms (should open the Vercel pages)
- Try a test purchase with card `4242 4242 4242 4242` if you have a shop with products

**Note:** The free Render server sleeps when idle. The first request can take 30–60 seconds.

## 4. Install a dev build on your iPhone (optional but recommended)

Requires a free Expo account (you have one: `aidannuge`).

```bash
cd LocalShop
eas build --platform ios --profile development
```

When the build finishes, open the link from the Expo dashboard and install on your phone. Test login, checkout, and legal links on a real device.

## 5. Apple Developer Program — required for TestFlight

You need the **$99/year** [Apple Developer Program](https://developer.apple.com/programs/) before TestFlight or App Store release.

After you enroll:

1. Create an app in [App Store Connect](https://appstoreconnect.apple.com) with bundle ID `com.localshop.app`.
2. Note your **Apple ID email** and **App Store Connect app ID** (numeric).
3. Update `LocalShop/eas.json` → `submit.production.ios` with `appleId` and `ascAppId`.
4. Replace the placeholder app icon at `LocalShop/assets/icon.png`.
5. Run:

```bash
cd LocalShop
eas build --platform ios --profile production
eas submit --platform ios
```

6. In App Store Connect → **TestFlight** → add yourself as an internal tester.

## 6. App Store listing (when ready for review)

Prepare in App Store Connect:

- Screenshots (6.7" and 6.5" iPhone)
- Short description, keywords, support URL (`mailto:support@localshop.app`)
- Privacy nutrition labels (match `legal/privacy.html`)
- Export compliance: standard encryption only (already set in the app config)

## Need help?

Say which step you are on (admin deploy, device build, Apple enrollment) and we can walk through it click by click.
