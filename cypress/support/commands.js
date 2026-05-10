Cypress.Commands.add('loginUI', (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login')
      cy.get('[data-testid="email"]').should('be.visible').type(email)
      cy.get('[data-testid="senha"]').should('be.visible').type(password, { parseSpecialCharSequences: false })
      cy.get('[data-testid="entrar"]').should('be.visible').click()
      cy.url().should('include', '/home')
    },
    {
      cacheAcrossSpecs: true,
    }
  )
})

Cypress.Commands.add('createProductUI', ({ name, price, description, quantity }) => {
  cy.get('[data-testid="nome"]').should('be.visible').clear().type(name)
  cy.get('[data-testid="preco"]').should('be.visible').clear().type(price)
  cy.get('[data-testid="descricao"]').should('be.visible').clear().type(description)
  cy.get('[data-testid="quantity"]').should('be.visible').clear().type(quantity)
  cy.get('[data-testid="cadastarProdutos"]').should('be.visible').click()
})

Cypress.Commands.add('createProductAPI', (overrides = {}) => {
  const { faker } = require('@faker-js/faker/locale/en')

  const product = {
    nome: overrides.nome ?? `${faker.commerce.productName()} ${Date.now()}`,
    preco: overrides.preco ?? faker.number.int({ min: 10, max: 1000 }),
    descricao: overrides.descricao ?? faker.commerce.productDescription().slice(0, 50),
    quantidade: overrides.quantidade ?? faker.number.int({ min: 1, max: 100 }),
  }

  cy.loginAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((token) => {
    return cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/produtos`,
      headers: { Authorization: token },
      body: product,
    }).then(({ body }) => ({ _id: body._id, nome: product.nome }))
  })
})

Cypress.Commands.add('loginAPI', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/login`,
    body: { email, password },
  }).then(({ body }) => {
    expect(body).to.have.property('authorization')
    return body.authorization
  })
})
