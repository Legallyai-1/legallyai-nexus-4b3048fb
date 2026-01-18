# Production Deployment Guide

## Environment Variables

### Required Variables
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

### Optional Variables
- `NODE_ENV` - Set to `production` for production builds

## Deployment Options

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Railway will automatically detect the build configuration from `railway.json`
4. Build command: `npm run build`
5. Start command: `npx serve dist -s -p $PORT`

### Manual Deployment
1. Build the application:
   ```bash
   npm install
   npm run build
   ```

2. The build output will be in the `dist` directory

3. Serve the static files using any static file server:
   ```bash
   npx serve dist -s
   ```

## Production Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase project is configured
- [ ] Build succeeds without errors
- [ ] Error boundary is in place
- [ ] Bundle size is optimized (< 500KB per chunk)
- [ ] All routes are lazy loaded
- [ ] Security headers are configured (if using custom server)
- [ ] Analytics/monitoring is configured
- [ ] Error tracking is set up (optional: Sentry, LogRocket)

## Performance Optimization

The application includes:
- ✅ Code splitting (40+ chunks)
- ✅ Lazy loading for all routes
- ✅ Vendor chunk optimization
- ✅ Tree shaking
- ✅ Minification
- ✅ Compression ready (gzip)

## Security

### Current Security Measures
- CORS configuration via Supabase
- Environment variable isolation
- Secure authentication via Supabase Auth
- Error boundary to prevent information leakage

### Known Vulnerabilities
The following npm dependencies have known vulnerabilities that require breaking changes to fix:
- `esbuild` (moderate) - Development-only dependency, not exposed in production
- `tar` (high) - Transitive dependency via @capacitor/cli, consider updating Capacitor if needed

These vulnerabilities do **not** affect the production bundle, as they are development dependencies.

## Monitoring

### Recommended Tools
- **Error Tracking**: Sentry, LogRocket, or Bugsnag
- **Analytics**: Google Analytics, Mixpanel, or Plausible
- **Performance**: Lighthouse CI, WebPageTest
- **Uptime**: UptimeRobot, Pingdom

### Adding Error Tracking
To add Sentry (example):
1. Install: `npm install @sentry/react`
2. Update `src/main.tsx` to initialize Sentry
3. Update `src/components/ErrorBoundary.tsx` to send errors to Sentry

## Troubleshooting

### Build Fails
- Check Node version (recommend v18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Runtime Errors
- Check browser console for errors
- Verify environment variables are set
- Check Supabase project status
- Review error boundary logs

### Performance Issues
- Check bundle size with `npm run build`
- Use Lighthouse to identify bottlenecks
- Review Network tab for slow requests
- Consider implementing service workers

## Support
For issues, please check:
1. GitHub Issues
2. Supabase Status Page
3. Railway Status Page
