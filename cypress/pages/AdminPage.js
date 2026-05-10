class AdminPage {
  
  get logoutButton()          { return cy.get('[data-testid="logout"]') }
  get cadastrarUsuariosLink() { return cy.get('[data-testid="cadastrar-usuarios"]') }
  get listarUsuariosLink()    { return cy.get('[data-testid="listar-usuarios"]') }
  get cadastrarProdutosLink() { return cy.get('[data-testid="cadastrar-produtos"]') }
  get listarProdutosLink()    { return cy.get('[data-testid="listar-produtos"]') }
  get relatoriosLink()        { return cy.get('[data-testid="link-relatorios"]') }

  visit() {
    cy.visit('/admin/home')
    this.logoutButton.should('be.visible')
  }

  shouldSeeAllNavMenus() {
    this.cadastrarUsuariosLink.should('be.visible')
    this.listarUsuariosLink.should('be.visible')
    this.cadastrarProdutosLink.should('be.visible')
    this.listarProdutosLink.should('be.visible')
    this.relatoriosLink.should('be.visible')
  }

  shouldNotSeeAdminControls() {
    this.cadastrarUsuariosLink.should('not.exist')
    this.listarUsuariosLink.should('not.exist')
    this.cadastrarProdutosLink.should('not.exist')
    this.listarProdutosLink.should('not.exist')
    this.relatoriosLink.should('not.exist')
  }
}

export default new AdminPage()
