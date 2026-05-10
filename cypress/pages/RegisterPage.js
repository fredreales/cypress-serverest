class RegisterPage {
  
  get nameInput()       { return cy.get('[data-testid="nome"]') }
  get emailInput()      { return cy.get('[data-testid="email"]') }
  get passwordInput()   { return cy.get('[data-testid="password"]') }
  get adminCheckbox()   { return cy.get('[data-testid="checkbox"]') }
  get submitButton()    { return cy.get('[data-testid="cadastrar"]') }
  get errorMessage()    { return cy.get('.alert-secondary') }
  get backToLoginLink() { return cy.get('[data-testid="entrar"]') }

  visit() {
    cy.visit('/cadastrarusuarios')
    this.submitButton.should('be.visible')
  }

  fillName(name) {
    this.nameInput.should('be.visible').clear().type(name)
  }

  fillEmail(email) {
    this.emailInput.should('be.visible').clear().type(email)
  }

  fillPassword(password) {
    this.passwordInput.should('be.visible').clear().type(password, { parseSpecialCharSequences: false })
  }

  checkAdmin() {
    this.adminCheckbox.should('be.visible').check()
  }

  submit() {
    this.submitButton.should('be.visible').click()
  }

  register({ name, email, password, isAdmin = false }) {
    this.fillName(name)
    this.fillEmail(email)
    this.fillPassword(password)
    if (isAdmin) this.checkAdmin()
    this.submit()
  }

  shouldShowErrorMessage(message) {
    this.errorMessage.should('be.visible').and('contain.text', message)
  }

  shouldBeOnRegisterPage() {
    cy.url().should('include', '/cadastrarusuarios')
  }
}

export default new RegisterPage()
