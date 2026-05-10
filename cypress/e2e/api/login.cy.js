
import loginSchema from '../../support/schemas/login.schema.json'

const API = Cypress.env('apiUrl')

describe('POST /login - API', () => {
  it('should authenticate with valid credentials and return a Bearer token', () => {
    cy.request({
      method: 'POST',
      url: `${API}/login`,
      body: {
        email: Cypress.env('adminEmail'),
        password: Cypress.env('adminPassword'),
      },
    }).validateSchema(loginSchema).then(({ status }) => {
      expect(status).to.eq(200)
    })
  })

  it('should return 401 when credentials are invalid', () => {
    cy.request({
      method: 'POST',
      url: `${API}/login`,
      body: { email: 'invalid@email.com', password: 'wrongpassword' },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(401)
      expect(body).to.have.property('message', 'Email e/ou senha inválidos')
    })
  })

  it('should return 400 when required fields are missing from the request body', () => {
    cy.request({
      method: 'POST',
      url: `${API}/login`,
      body: {},
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(400)
      expect(body).to.have.property('email')
      expect(body).to.have.property('password')
    })
  })
})
