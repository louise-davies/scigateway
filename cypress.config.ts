import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  video: false,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://127.0.0.1:3000',
  },
})
