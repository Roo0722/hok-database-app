import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jnjnbnd.hokdatabase',
  appName: 'HoK Database',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#0D0D0D',
  },
};

export default config;
