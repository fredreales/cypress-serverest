import RegisterPage from '../../pages/RegisterPage'
import LoginPage from '../../pages/LoginPage'
import { faker } from '@faker-js/faker/locale/en'


describe('User Registration - Frontend', () => {
  beforeEach(() => {
    RegisterPage.visit()
  })

  it('should register a new user successfully and stay on the register page', () => {
    cy.intercept('POST', '**/usuarios').as('createUser')

    const user = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alphanumeric(10),
    }

    RegisterPage.register(user)

    cy.wait('@createUser').its('response.statusCode').should('eq', 201)
    RegisterPage.shouldBeOnRegisterPage()
  })

  it('should display an error when registering with an already existing email', () => {
    RegisterPage.register({
      name: 'Duplicate User',
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
    })
    RegisterPage.shouldShowErrorMessage('Este email já está sendo usado')
  })

  it('should navigate back to login when clicking the back link', () => {
    RegisterPage.backToLoginLink.click()
    LoginPage.shouldBeOnLoginPage()
  })
})
