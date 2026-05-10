class StorePage {

  get searchInput()    { return cy.get('[data-testid="pesquisar"]') }
  get searchButton()   { return cy.get('[data-testid="botaoPesquisar"]') }
  get productLinks()   { return cy.get('[data-testid="product-detail-link"]') }

  get navMenus() {
    return [
      '[data-testid="lista-de-compras"]',
      '[data-testid="carrinho"]',
    ]
  }

  visit() {
    cy.visit('/home')
    this.searchInput.should('be.visible')
  }

  search(term) {
    this.searchInput.should('be.visible').clear().type(term)
    this.searchButton.should('be.visible').click()
  }

  shouldSeeAllNavMenus() {
    this.navMenus.forEach((selector) => cy.get(selector).should('be.visible'))
  }

  shouldHaveProducts() {
    this.productLinks.should('have.length.greaterThan', 0)
  }
}

export default new StorePage()
