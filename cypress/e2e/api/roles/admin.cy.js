const API = Cypress.env('apiUrl')

describe('admin user permissions', () => {
  let adminToken

  before(() => {
    cy.loginAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((token) => {
      adminToken = token
    })
  })

  it('should create a product when authenticated as admin', () => {
    cy.request({
      method: 'POST',
      url: `${API}/produtos`,
      headers: { Authorization: adminToken },
      body: {
        nome: `Admin Product ${Date.now()}`,
        preco: 50,
        descricao: 'Created by admin',
        quantidade: 3,
      },
    }).then(({ status, body }) => {
      expect(status).to.eq(201)
      expect(body).to.have.property('_id')

      cy.request({
        method: 'DELETE',
        url: `${API}/produtos/${body._id}`,
        headers: { Authorization: adminToken },
      })
    })
  })

  it('should delete a product when authenticated as admin', () => {
    cy.createProductAPI().then(({ _id }) => {
      cy.request({
        method: 'DELETE',
        url: `${API}/produtos/${_id}`,
        headers: { Authorization: adminToken },
      }).then(({ status }) => {
        expect(status).to.eq(200)
      })
    })
  })
})
