const { defineConfig } = require('cypress')

// Sensitive values (adminEmail, adminPassword, apiUrl) come from cypress.env.json (gitignored).
// Copy cypress.env.json.example → cypress.env.json and fill in the values before running.
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
    setupNodeEvents(on) {
      on('task', {
        log({ label, ids }) {
          console.log(`\n=== ${label} ===`)
          ids.forEach((id) => console.log(' ', id))
          return null
        },
      })
    },
  },
})
