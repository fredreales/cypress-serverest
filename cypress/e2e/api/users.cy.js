import { faker } from '@faker-js/faker/locale/en'
import usersListSchema from '../../support/schemas/users-list.schema.json'
import successMessageSchema from '../../support/schemas/success-message.schema.json'

const API = Cypress.env('apiUrl')

describe('Users - API (/usuarios)', () => {
  it('GET /usuarios - should list users and validate response schema', () => {
    cy.request('GET', `${API}/usuarios`)
      .validateSchema(usersListSchema)
      .then(({ status }) => {
        expect(status).to.eq(200)
      })
  })

  it('POST /usuarios - should create a new user and validate response schema', () => {
    cy.request({
      method: 'POST',
      url: `${API}/usuarios`,
      body: {
        nome: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.string.alphanumeric(10),
        administrador: 'false',
      },
    }).validateSchema(successMessageSchema).then(({ status }) => {
      expect(status).to.eq(201)
    })
  })

  it('DELETE /usuarios/:id - should delete a previously created user', () => {
    cy.request('POST', `${API}/usuarios`, {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alphanumeric(10),
      administrador: 'false',
    }).then(({ body }) => {
      cy.request({
        method: 'DELETE',
        url: `${API}/usuarios/${body._id}`,
      }).validateSchema(successMessageSchema).then(({ status }) => {
        expect(status).to.eq(200)
      })
    })
  })
})
