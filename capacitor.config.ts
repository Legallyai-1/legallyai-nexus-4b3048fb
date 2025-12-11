import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legallyai.app',
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
