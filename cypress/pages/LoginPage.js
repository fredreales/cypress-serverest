class LoginPage {

  get emailInput()    { return cy.get('[data-testid="email"]') }
  get passwordInput() { return cy.get('[data-testid="senha"]') }
  get submitButton()  { return cy.get('[data-testid="entrar"]') }
  get errorMessage()  { return cy.get('.alert-secondary') }
  get registerLink()  { return cy.get('[data-testid="cadastrar"]') }

  visit() {
    cy.visit('/login')
    this.submitButton.should('be.visible')
  }

  fillEmail(email) {
    this.emailInput.should('be.visible').clear().type(email)
  }

  fillPassword(password) {
    this.passwordInput.should('be.visible').clear().type(password, { parseSpecialCharSequences: false })
  }

  submit() {
    this.submitButton.should('be.visible').click()
  }

  login(email, password) {
    this.fillEmail(email)
    this.fillPassword(password)
    this.submit()
  }

  shouldShowErrorMessage(message) {
    this.errorMessage.should('be.visible').and('contain.text', message)
  }

  shouldBeOnLoginPage() {
    cy.url().should('include', '/login')
  }

  shouldRedirectToHome() {
    cy.url().should('include', '/home')
  }
}

export default new LoginPage()
