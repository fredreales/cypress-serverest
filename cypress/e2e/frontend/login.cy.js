import LoginPage from '../../pages/LoginPage'


describe('Login tests', () => {
  beforeEach(() => {
    LoginPage.visit()
  })

  it('should log in with valid credentials and redirect to home', () => {
    LoginPage.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'))
    LoginPage.shouldRedirectToHome()
  })

  it('should display an error message when credentials are invalid', () => {
    LoginPage.login('invalid@email.com', 'wrongpassword')
    LoginPage.shouldBeOnLoginPage()
    LoginPage.shouldShowErrorMessage('Email e/ou senha inválidos')
  })

  it('should navigate to the register page when clicking the "Cadastrar" link', () => {
    LoginPage.registerLink.click()
    cy.url().should('include', '/cadastrarusuarios')
  })
})
