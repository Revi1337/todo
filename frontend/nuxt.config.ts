export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],

  colorMode: {
    classSuffix: '',
  },

  routeRules: {
    '/api/**': { proxy: 'http://localhost:8080/api/**' },
  },
})
