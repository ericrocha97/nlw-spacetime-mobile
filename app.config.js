import 'dotenv/config'

module.exports = {
  expo: {
    name: 'NLW Spacetime',
    slug: 'nlw-spacetime',
    scheme: 'nlwspacetime',
    version: '1.0.0',
    extra: {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      API_URL: process.env.API_URL,
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#09090a',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#736494',
      },
    },
  },
}
