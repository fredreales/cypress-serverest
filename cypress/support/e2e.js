import './commands'
import 'cypress-ajv-schema-validator'

Cypress.on('uncaught:exception', () => false)

// Create the admin user before each spec.
// Uses failOnStatusCode: false so subsequent specs don't fail when the user already exists (400).
before(() => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/usuarios`,
    failOnStatusCode: false,
    body: {
      nome: 'Admin QA',
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
      administrador: 'true',
    },
  })
})
