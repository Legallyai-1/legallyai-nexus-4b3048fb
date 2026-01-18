export interface AdPayload {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface AdMobConfig {
  adUnitId: string;
  testDeviceIds?: string[];
}

export const ADMOB_AD_UNITS = {
  BANNER_HOME: 'ca-app-pub-XXXXX/YYYYY',
  BANNER_SIDEBAR: 'ca-app-pub-XXXXX/ZZZZZ',
  INTERSTITIAL: 'ca-app-pub-XXXXX/AAAAA',
  REWARDED: 'ca-app-pub-XXXXX/BBBBB',
} as const;
