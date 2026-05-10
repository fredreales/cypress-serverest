import AdminPage from '../../../pages/AdminPage'
import ProductsPage from '../../../pages/ProductsPage'

describe('Role-based Access Control - Admin - Frontend', () => {
  beforeEach(() => {
    cy.loginUI(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
    AdminPage.visit()
  })

  it('should see all admin navigation links', () => {
    AdminPage.shouldSeeAllNavMenus()
  })

  it('should navigate to the product creation form', () => {
    ProductsPage.clickAddProduct()
    ProductsPage.shouldBeOnCreateFormPage()
  })
})
