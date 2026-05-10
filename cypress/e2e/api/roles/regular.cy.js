import { faker } from '@faker-js/faker/locale/en'


const API = Cypress.env('apiUrl')

describe('regular user permissions', () => {
  let regularUserToken
  let regularUserId

  before(() => {
    const regularUser = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alphanumeric(10),
      administrador: 'false',
    }

    cy.request('POST', `${API}/usuarios`, regularUser).then(({ body }) => {
      regularUserId = body._id

      cy.loginAPI(regularUser.email, regularUser.password).then((token) => {
        regularUserToken = token
      })
    })
  })

  after(() => {
    cy.request({ method: 'DELETE', url: `${API}/usuarios/${regularUserId}` })
  })

  it('should return 403 when trying to create a product', () => {
    cy.request({
      method: 'POST',
      url: `${API}/produtos`,
      headers: { Authorization: regularUserToken },
      body: {
        nome: faker.commerce.productName(),
        preco: 10,
        descricao: 'Should not be created',
        quantidade: 1,
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(403)
      expect(body).to.have.property('message', 'Rota exclusiva para administradores')
    })
  })

  it('should return 403 when trying to delete a product', () => {
    cy.request({
      method: 'DELETE',
      url: `${API}/produtos/fake-product-id`,
      headers: { Authorization: regularUserToken },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(403)
      expect(body).to.have.property('message', 'Rota exclusiva para administradores')
    })
  })

  it('should return 403 when trying to update a product', () => {
    cy.request({
      method: 'PUT',
      url: `${API}/produtos/fake-product-id`,
      headers: { Authorization: regularUserToken },
      body: {
        nome: faker.commerce.productName(),
        preco: 1,
        descricao: 'Should not be updated',
        quantidade: 1,
      },
      failOnStatusCode: false,
    }).then(({ status, body }) => {
      expect(status).to.eq(403)
      expect(body).to.have.property('message', 'Rota exclusiva para administradores')
    })
  })
})
