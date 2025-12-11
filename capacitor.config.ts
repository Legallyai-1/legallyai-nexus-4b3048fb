import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.25a66f7dcf1c44678aa161688905fd45',
  appName: 'LegallyAI',
  webDir: 'dist',
  server: {
    url: 'https://25a66f7d-cf1c-4467-8aa1-61688905fd45.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
