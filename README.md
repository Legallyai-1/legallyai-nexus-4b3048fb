# LegallyAI - Production Legal Tech Platform

## 🚀 Quick Deploy

### Option 1: Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Legallyai-1/legallyai-nexus-4b3048fb)

### Option 2: Deploy to Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Legallyai-1/legallyai-nexus-4b3048fb)

## 🛠️ Local Development

```bash
git clone https://github.com/Legallyai-1/legallyai-nexus-4b3048fb.git
cd legallyai-nexus-4b3048fb
npm install
npm run dev
```

Open http://localhost:8080

## 📦 Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** shadcn-ui + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Functions)
- **Deployment:** Vercel / Netlify
- **Mobile:** Capacitor (iOS/Android)

## 🔧 Environment Setup

Create `.env` file:
```env
VITE_SUPABASE_URL=https://wejiqqtwnhevcjdllodr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_SUPABASE_PROJECT_ID=wejiqqtwnhevcjdllodr
```

## 🚀 Deploy to Production

### Vercel (Auto-deploys on git push)
1. Fork this repo
2. Connect to Vercel
3. Add environment variables
4. Deploy!

### Netlify
1. Fork this repo
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

## 📱 Mobile Apps

### Android
```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease
```

### iOS
```bash
npm run build
npx cap sync ios
open ios/App/App.xcworkspace
```

## 💰 Monetization

- **Subscriptions:** Database-powered tiers (Free, Premium, Pro, Enterprise)
- **Ads:** Google AdSense (web) + AdMob (mobile)
- **Documents:** Pay-per-document option
- **Credits:** User wallet system

## 🔒 Security

- Row Level Security (RLS) enabled
- Environment variables for secrets
- HTTPS only
- Regular security audits

## 📖 Documentation

- [API Documentation](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture](./docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- **Issues:** https://github.com/Legallyai-1/legallyai-nexus-4b3048fb/issues
- **Email:** support@legallyai.ai
- **Documentation:** https://docs.legallyai.ai

---

**Built with 💙 by the LegallyAI team**
