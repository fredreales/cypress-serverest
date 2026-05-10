# Cypress ServeRest — Test Automation

![CI](https://github.com/<your-username>/cypress-serverest/actions/workflows/ci.yml/badge.svg)

Automated E2E and API tests with **Cypress** for the [ServeRest](https://front.serverest.dev/) application.

## Tech Stack

- [Cypress](https://www.cypress.io/) v14+
- [@faker-js/faker](https://fakerjs.dev/) — dynamic test data generation
- [cypress-ajv-schema-validator](https://github.com/filiphric/cypress-ajv-schema-validator) — JSON Schema validation for API responses
- Page Object Model (POM)

## Project Structure

```
cypress/
├── e2e/
│   ├── api/                        # API tests via cy.request
│   │   ├── login.cy.js
│   │   ├── users.cy.js
│   │   ├── products.cy.js
│   │   └── roles/
│   │       ├── admin.cy.js
│   │       └── regular.cy.js
│   └── frontend/                   # UI end-to-end tests
│       ├── login.cy.js
│       ├── register.cy.js
│       ├── products.cy.js
│       └── roles/
│           ├── admin.cy.js
│           └── regular.cy.js
├── pages/                          # Page Objects (POM)
│   ├── AdminPage.js
│   ├── LoginPage.js
│   ├── ProductsPage.js
│   ├── RegisterPage.js
│   └── StorePage.js
└── support/
    ├── schemas/                    # JSON Schema files for API contract validation
    │   ├── login.schema.json
    │   ├── user.schema.json
    │   ├── users-list.schema.json
    │   ├── product.schema.json
    │   ├── products-list.schema.json
    │   └── success-message.schema.json
    ├── commands.js                 # Custom commands
    └── e2e.js                      # Global setup
```

## Test Coverage

26 tests across 10 spec files.

### API
| Spec | Tests |
|---|---|
| `api/login.cy.js` | Valid login returns Bearer token (schema); 401 on invalid credentials; 400 on missing body |
| `api/users.cy.js` | List users (schema); create user (schema); delete user |
| `api/products.cy.js` | List products (schema); create product as admin (schema); update product (schema) |
| `api/roles/admin.cy.js` | Admin can create a product; admin can delete a product |
| `api/roles/regular.cy.js` | Regular user gets 403 on create, delete and update product |

### Frontend
| Spec | Tests |
|---|---|
| `frontend/login.cy.js` | Login with valid credentials; error on invalid credentials; navigate to register |
| `frontend/register.cy.js` | Register new user; error on duplicate email; navigate back to login |
| `frontend/products.cy.js` | Full CRUD flow (create via UI → edit via API → delete via UI); product search on store |
| `frontend/roles/admin.cy.js` | Admin sees all nav links; admin can navigate to product creation form |
| `frontend/roles/regular.cy.js` | Regular user sees store nav links; regular user does not see admin controls |

## Custom Commands

| Command | Description |
|---|---|
| `cy.loginUI(email, password)` | Logs in via UI using `cy.session` (cached across specs) |
| `cy.loginAPI(email, password)` | Authenticates via `POST /login` and returns the Bearer token |
| `cy.createProductUI({ name, price, description, quantity })` | Fills and submits the product creation form |
| `cy.createProductAPI(overrides?)` | Creates a product via API with faker defaults; returns `{ _id, nome }` |

## Credential Strategy

ServeRest is a **public shared API** — any user can be deleted by third parties at any time. To guarantee test isolation, admin credentials are generated dynamically on every run:

- **`cypress.config.js` (`setupNodeEvents`)** generates a unique email (`admin_<timestamp>@qarun.com`) and a fixed password once per run in Node.js, before any spec executes.
- **`cypress/support/e2e.js` (`before` hook)** sends `POST /usuarios` before each spec to ensure the admin user exists. The first spec creates it (201); subsequent specs receive a 400 (email already in use) which is intentionally ignored via `failOnStatusCode: false`. Only **one user is created** per run.

This means no hardcoded credentials anywhere in the codebase, and no dependency on pre-existing data in the shared environment.

## Local Setup

```bash
npm install
```

**`cypress.env.json`** (gitignored) only needs the API URL:

```json
{
  "apiUrl": "https://serverest.dev"
}
```

Admin credentials are auto-generated at runtime — no manual configuration needed.

## Running Tests

```bash
# Open Cypress UI (interactive mode)
npm run cy:open

# Run all tests headless
npm run cy:run

# Run only API tests
npm run cy:run:api

# Run only frontend tests
npm run cy:run:frontend
```

## CI/CD (GitHub Actions)

The pipeline runs on every push and pull request to `main`/`master`. API and frontend tests run **in parallel** for faster feedback. In-progress runs are automatically cancelled on new pushes (`concurrency` + `cancel-in-progress: true`).

### Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `CYPRESS_API_URL` | `https://serverest.dev` |

Admin credentials are generated at runtime by `setupNodeEvents` — no credential secrets needed in CI.

### Artifacts

Screenshots are automatically uploaded as artifacts when any test fails (retained for 7 days).
