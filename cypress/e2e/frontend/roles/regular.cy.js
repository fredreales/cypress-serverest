import { faker } from '@faker-js/faker/locale/en'
import AdminPage from '../../../pages/AdminPage'
import StorePage from '../../../pages/StorePage'

const API = Cypress.env('apiUrl')

describe('Role-based Access Control - Regular User - Frontend', () => {
  let regularUser
  let regularUserId

  before(() => {
    regularUser = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.string.alphanumeric(10),
      administrador: 'false',
    }

    cy.request('POST', `${API}/usuarios`, regularUser).then(({ body }) => {
      regularUserId = body._id
    })
  })

  beforeEach(() => {
    cy.loginUI(regularUser.email, regularUser.password)
    StorePage.visit()
  })

  after(() => {
    cy.request({ method: 'DELETE', url: `${API}/usuarios/${regularUserId}` })
  })

  it('should see regular user navigation links', () => {
    StorePage.shouldSeeAllNavMenus()
  })

  it('should not see admin controls', () => {
    AdminPage.shouldNotSeeAdminControls()
  })
})
