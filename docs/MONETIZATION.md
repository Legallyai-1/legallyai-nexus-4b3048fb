# Monetization Setup Guide

This guide shows how to configure AdSense, AdMob, and bank payouts.

## 1. Google AdSense (Web Ads)

### Create Account

1. Go to [adsense.google.com](https://adsense.google.com)
2. Sign in with Google account
3. Enter your domain (will be Vercel/Netlify URL)
4. Submit application
5. Wait for approval (1-2 weeks)

### Get Publisher ID

1. After approval, go to Account → Account Information
2. Copy Publisher ID (format: `pub-XXXXXXXXXXXXXXXX`)

### Update Code

1. **Update `public/ads.txt`:**
```
google.com, pub-YOUR_PUBLISHER_ID, DIRECT, f08c47fec0942fa0
```

2. **Verify `index.html` has AdSense script:**
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID" crossorigin="anonymous"></script>
```

3. **Create Ad Units in AdSense Dashboard:**
   - Go to Ads → Overview → By ad unit
   - Click "+ New ad unit"
   - Create units for each page:
     - Home Banner (Display ad, Responsive)
     - Chat Sidebar (Vertical banner)
     - Generate Page (In-article)
     - Etc.
   - Copy ad slot IDs

4. **Update `src/components/ads/AdBanner.tsx`:**
```typescript
// Replace placeholders with real slot IDs
const AD_SLOTS = {
  HOME_BANNER: "1234567890", // From AdSense dashboard
  CHAT_BANNER: "2345678901",
  GENERATE_BANNER: "3456789012",
  // ...
};
```

### Verify Setup

1. Deploy your app
2. Visit a page with ads
3. Check browser console for AdSense errors
4. Wait 24-48 hours for ads to show

---

## 2. Google AdMob (Mobile Ads)

### Create Account

1. Go to [admob.google.com](https://admob.google.com)
2. Sign in with same Google account as AdSense
3. Create account

### Create App

1. Click "Apps" → "Add App"
2. Select "Android" platform
3. Enter app name: "LegallyAI"
4. Add app to your account
5. Copy AdMob App ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### Create Ad Units

1. Click "Ad units" → "Add ad unit"
2. Select "Banner"
3. Create units for each page:
   - Home Banner
   - Chat Banner
   - Generate Banner
   - Custody Banner
   - DUI Banner
   - Etc. (10+ units)
4. Copy each Ad Unit ID (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### Update Code

1. **Update `android/app/src/main/AndroidManifest.xml`:**
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-YOUR_PUBLISHER_ID~YOUR_APP_ID"/>
```

2. **Update `src/components/ads/AdMobBanner.tsx`:**
```typescript
export const ADMOB_AD_UNITS = {
  HOME_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/1111111111", // Real unit ID
  CHAT_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/2222222222",
  ASSISTANTS_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/3333333333",
  CUSTODY_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/4444444444",
  DUI_BANNER: "ca-app-pub-XXXXXXXXXXXXXXXX/5555555555",
  // ... add all your unit IDs
};
```

### Verify Setup

1. Build Android APK
2. Install on device
3. Open app and navigate pages
4. Verify banner ads load
5. Check AdMob dashboard for impressions

---

## 3. Revenue Tracking

The app automatically tracks ad impressions to the database.

### View Revenue

1. Log in to your app
2. Go to Monetization page
3. View:
   - Total ad revenue
   - Impressions count
   - Click-through rate
   - Revenue by source (AdSense vs AdMob)

### Database Tables

Revenue is stored in:
- `ad_impressions` - Individual ad views/clicks
- `user_credits` - Aggregated earnings

---

## 4. Bank Account Setup

### Connect Bank

1. Log in to your deployed app
2. Go to Account → Earnings
3. Click "Connect Bank Account"
4. Enter:
   - Bank name
   - Account number
   - Routing number
   - Account holder name
5. Verify with micro-deposits (2-3 days)

### Request Payout

1. Wait until balance > $100
2. Click "Request Payout"
3. Enter amount
4. Confirm
5. Wait 3-5 business days for transfer

### Payout Processing

Payouts are processed:
- Automatically if configured with payment gateway
- Manually by admin if using database-only mode

**For Production:** Integrate with:
- Stripe Connect
- PayPal Payouts API
- Plaid (bank verification)
- Wise (international)

---

## 5. Revenue Optimization

### Increase AdSense Revenue

1. **Ad Placement:**
   - Above the fold
   - Between content sections
   - Sidebar (right side)

2. **Ad Formats:**
   - Responsive display ads
   - In-feed ads (content pages)
   - In-article ads (blog posts)

3. **Content:**
   - High-quality legal content
   - Regular updates
   - Good SEO

### Increase AdMob Revenue

1. **Ad Frequency:**
   - Banner on every screen
   - Interstitial between screens
   - Rewarded ads for premium features

2. **Ad Mediation:**
   - Enable in AdMob dashboard
   - Add multiple ad networks
   - Maximize fill rate

3. **User Engagement:**
   - More app usage = more ads
   - Better UX = longer sessions
   - Push notifications = return visits

### Subscription Optimization

1. **Free Tier:**
   - Limited features
   - Show upgrade prompts
   - Highlight paid benefits

2. **Pricing:**
   - A/B test price points
   - Offer annual discount
   - Create urgency (limited offer)

3. **Features:**
   - Gate premium features
   - Unlimited documents for paid
   - Priority support

---

## 6. Analytics

### Google Analytics

Add to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Track Events

```typescript
// Track ad impressions
gtag('event', 'ad_impression', {
  ad_unit: 'home_banner',
  page_path: '/home'
});

// Track conversions
gtag('event', 'subscribe', {
  tier: 'premium',
  amount: 9.99
});
```

---

## Troubleshooting

**Ads not showing:**
- Wait 24-48 hours after setup
- Check browser ad blocker
- Verify ads.txt file accessible
- Check AdSense account status

**Low revenue:**
- Improve ad placement
- Increase traffic
- Target high-CPC keywords
- Enable ad mediation

**Payout issues:**
- Verify bank account
- Check minimum payout threshold
- Confirm identity with payment provider

---

**Next:** [Bank Integration Details](./BANK_INTEGRATION.md)
