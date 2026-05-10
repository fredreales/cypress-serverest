import ProductsPage from '../../pages/ProductsPage'
import StorePage from '../../pages/StorePage'
import { faker } from '@faker-js/faker/locale/en'

const API = Cypress.env('apiUrl')

describe('Product Management - Frontend', () => {
  beforeEach(() => {
    cy.loginUI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
    ProductsPage.visit()
  })

  context('Admin - CRUD', () => {
    it('should create, edit and delete a product', () => {
      const productName = `${faker.commerce.productName()} ${Date.now()}`
      const updatedName = `${productName} Updated`

      ProductsPage.clickAddProduct()
      ProductsPage.shouldBeOnCreateFormPage()
      cy.createProductUI({
        name: productName,
        price: faker.number.int({ min: 10, max: 999 }),
        description: faker.commerce.productDescription().slice(0, 50),
        quantity: faker.number.int({ min: 1, max: 100 }),
      })
      ProductsPage.shouldBeOnProductListPage()
      ProductsPage.shouldShowProductInList(productName)

      // Edit via API (UI edit button is broken in ServeRest)
      cy.request('GET', `${API}/produtos?nome=${productName}`).then(({ body }) => {
        const productId = body.produtos[0]._id

        cy.loginAPI(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((token) => {
          cy.request({
            method: 'PUT',
            url: `${API}/produtos/${productId}`,
            headers: { Authorization: token },
            body: { nome: updatedName, preco: 200, descricao: 'Updated', quantidade: 20 },
          })
        })
      })

      // Verify updated name in the list
      cy.reload()
      ProductsPage.shouldShowProductInList(updatedName)

      // Delete via UI
      ProductsPage.deleteProduct(updatedName)
      ProductsPage.shouldNotShowProductInList(updatedName)
    })
  })

  context('Store - product search', () => {
    it('should search and find a product on the store front', () => {
      ProductsPage.navigateToProductList()
      ProductsPage.shouldBeOnProductListPage()

      cy.get('tbody tr').first().find('td').first()
        .invoke('text')
        .then((productName) => {
          const searchTerm = productName.trim().split(' ')[0]

          StorePage.visit()
          StorePage.shouldHaveProducts()
          StorePage.search(searchTerm)
          StorePage.productLinks.should('have.length.at.least', 1)
        })
    })
  })
})
