// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/eslint'],
  plugins: ['~/plugins/socket.io'],
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  ui: {
    colorMode: false,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL,
      apiBaseUrlWs: process.env.NUXT_PUBLIC_API_BASE_URL_WS,
    },
  },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
