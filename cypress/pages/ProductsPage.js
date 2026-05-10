class ProductsPage {
  // Admin dashboard nav selectors
  get addProductButton()   { return cy.get('[data-testid="cadastrarProdutos"]') }
  get productListLink()    { return cy.get('[data-testid="listarProdutos"]') }
  get logoutButton()       { return cy.get('[data-testid="logout"]') }

  // Product form selectors
  get nameInput()          { return cy.get('[data-testid="nome"]') }
  get priceInput()         { return cy.get('[data-testid="preco"]') }
  get descriptionInput()   { return cy.get('[data-testid="descricao"]') }
  get quantityInput()      { return cy.get('[data-testid="quantity"]') }
  get saveButton()         { return cy.get('[data-testid="cadastarProdutos"]') }

  visit() {
    cy.visit('/admin/home')
    this.logoutButton.should('be.visible')
  }

  clickAddProduct() {
    this.addProductButton.should('be.visible').click()
  }

  navigateToProductList() {
    this.productListLink.should('be.visible').click()
  }

  fillProductForm({ name, price, description, quantity }) {
    this.nameInput.should('be.visible').clear().type(name)
    this.priceInput.should('be.visible').clear().type(price)
    this.descriptionInput.should('be.visible').clear().type(description)
    this.quantityInput.should('be.visible').clear().type(quantity)
  }

  saveProduct() {
    this.saveButton.should('be.visible').click()
  }

  editProduct(productName) {
    cy.contains('td', productName)
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Editar').should('be.visible').click()
      })
  }

  deleteProduct(productName) {
    cy.contains('td', productName)
      .parent('tr')
      .within(() => {
        cy.contains('button', 'Excluir').should('be.visible').click()
      })
  }

  shouldBeOnProductListPage() {
    cy.url().should('include', '/admin/listarprodutos')
    cy.get('[data-testid="listar-produtos"]').should('be.visible')
  }

  shouldBeOnCreateFormPage() {
    cy.url().should('include', '/admin/cadastrarprodutos')
    this.saveButton.should('be.visible')
  }

  shouldBeOnEditFormPage() {
    cy.url().should('include', '/admin/editarproduto')
    this.saveButton.should('be.visible')
  }

  shouldShowProductInList(productName) {
    cy.contains('td', productName).should('be.visible')
  }

  shouldNotShowProductInList(productName) {
    cy.contains('td', productName).should('not.exist')
  }
}

export default new ProductsPage()
