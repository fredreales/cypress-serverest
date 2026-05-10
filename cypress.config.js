const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://front.serverest.dev',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents(_on, config) {
      // Generate unique admin credentials per run to avoid conflicts on the shared ServeRest API
      const ts = Date.now()
      config.env.adminEmail    = `admin_${ts}@qarun.com`
      config.env.adminPassword = 'Cypress@run1'

      return config
    },
  },
})
