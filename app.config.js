import 'dotenv/config'

module.exports = {
  expo: {
    name: 'mobile',
    slug: 'mobile',
    scheme: 'nlwspacetime',
    version: '1.0.0',
    extra: {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      API_URL: process.env.API_URL,
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
}
