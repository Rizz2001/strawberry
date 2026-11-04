import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.strawchell.caja',
  appName: 'strawchell',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
