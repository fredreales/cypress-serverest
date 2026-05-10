import { faker } from '@faker-js/faker/locale/en'
import productsListSchema from '../../support/schemas/products-list.schema.json'
import successMessageSchema from '../../support/schemas/success-message.schema.json'

const API = Cypress.env('apiUrl')

describe('Products - API (/produtos)', () => {
  let authToken

  before(() => {
    cy.loginAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((token) => {
      authToken = token
    })
  })

  it('GET /produtos - should list products and validate response schema', () => {
    cy.request('GET', `${API}/produtos`)
      .validateSchema(productsListSchema)
      .then(({ status }) => {
        expect(status).to.eq(200)
      })
  })

  it('POST /produtos - should create an authenticated product and validate response schema', () => {
    cy.request({
      method: 'POST',
      url: `${API}/produtos`,
      headers: { Authorization: authToken },
      body: {
        nome: `${faker.commerce.productName()} ${Date.now()}`,
        preco: faker.number.int({ min: 10, max: 1000 }),
        descricao: faker.commerce.productDescription().slice(0, 50),
        quantidade: faker.number.int({ min: 1, max: 100 }),
      },
    }).validateSchema(successMessageSchema).then(({ status }) => {
      expect(status).to.eq(201)
    })
  })

  it('PUT /produtos/:id - should update a product and validate response schema', () => {
    cy.createProductAPI().then(({ _id }) => {
      cy.request({
        method: 'PUT',
        url: `${API}/produtos/${_id}`,
        headers: { Authorization: authToken },
        body: {
          nome: `Cypress Product Updated ${Date.now()}`,
          preco: 200,
          descricao: 'Updated',
          quantidade: 20,
        },
      }).validateSchema(successMessageSchema).then(({ status }) => {
        expect(status).to.eq(200)
      })
    })
  })
})
