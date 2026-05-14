# Arquitetura do Projeto de Testes — Cypress ServeRest

Este documento explica a estrutura, as decisões de arquitetura e o raciocínio por trás de cada escolha do projeto. O objetivo é servir como guia de estudo para entrevistas técnicas em QA/SDET.

---

## Visão Geral

O projeto cobre testes **E2E de frontend** e **testes de API** para a aplicação ServeRest usando Cypress 14. A arquitetura segue três princípios centrais:

1. **Separação de responsabilidades** — cada camada tem um papel claro
2. **Isolamento de dados** — cada execução é independente e não depende de dados preexistentes
3. **Legibilidade** — testes devem ser lidos como especificações de comportamento

---

## Estrutura de Pastas

```
cypress/
├── e2e/
│   ├── api/                    # Testes de contrato e regras de negócio via HTTP
│   │   ├── login.cy.js
│   │   ├── users.cy.js
│   │   ├── products.cy.js
│   │   └── roles/              # Testes de permissão por papel (role-based)
│   │       ├── admin.cy.js
│   │       └── regular.cy.js
│   └── frontend/               # Testes E2E de interface
│       ├── login.cy.js
│       ├── register.cy.js
│       ├── products.cy.js
│       └── roles/
│           ├── admin.cy.js
│           └── regular.cy.js
├── pages/                      # Page Objects (POM)
│   ├── AdminPage.js
│   ├── LoginPage.js
│   ├── ProductsPage.js
│   ├── RegisterPage.js
│   └── StorePage.js
└── support/
    ├── schemas/                # Schemas JSON para validação de contrato de API
    │   └── *.schema.json
    ├── commands.js             # Custom commands reutilizáveis
    └── e2e.js                  # Setup global (roda antes de cada spec)
```

**Por que separar `api/` de `frontend/`?**
São responsabilidades diferentes. Testes de API validam o contrato HTTP (status codes, schema do response, regras de negócio). Testes de frontend validam fluxos de usuário na interface. Separar permite rodar os dois em paralelo na CI e identificar com precisão onde está a falha.

**Por que a pasta `roles/` dentro de `api/` e `frontend/`?**
Testes de controle de acesso (RBAC) merecem isolamento. Misturá-los com os testes funcionais tornaria difícil entender o que está sendo testado. A separação deixa claro: "aqui testamos *quem pode fazer o quê*".

---

## Page Object Model (POM)

### O que é

POM é um padrão de design que abstrai os detalhes de implementação da UI (seletores, ações) para fora dos testes. Os testes descrevem *comportamento*, as pages descrevem *como interagir com a UI*.

### Como implementamos

Cada Page Object tem três tipos de membros:

```js
class LoginPage {
  // 1. GETTERS — retornam elementos Cypress (cy.get)
  get emailInput()    { return cy.get('[data-testid="email"]') }
  get passwordInput() { return cy.get('[data-testid="senha"]') }
  get submitButton()  { return cy.get('[data-testid="entrar"]') }

  // 2. ACTIONS — interações com a página
  visit() {
    cy.visit('/login')
    this.submitButton.should('be.visible')  // garante que a página carregou
  }

  login(email, password) {
    this.emailInput.should('be.visible').clear().type(email)
    this.passwordInput.should('be.visible').clear().type(password, { parseSpecialCharSequences: false })
    this.submitButton.should('be.visible').click()
  }

  // 3. ASSERTIONS — verificações de estado
  shouldRedirectToHome() {
    cy.url().should('include', '/home')
  }

  shouldShowErrorMessage(message) {
    cy.contains(message).should('be.visible')
  }
}

export default new LoginPage()  // singleton — uma instância compartilhada
```

### Por que usamos getters JavaScript (`get`) em vez de métodos ou propriedades?

```js
// ❌ Propriedade — o cy.get() é chamado na inicialização da classe, fora do contexto do teste
this.emailInput = cy.get('[data-testid="email"]')

// ❌ Método — funciona, mas exige parênteses na chamada: LoginPage.emailInput()
emailInput() { return cy.get('[data-testid="email"]') }

// ✅ Getter — chamado no momento do uso, sem parênteses, dentro do contexto correto do Cypress
get emailInput() { return cy.get('[data-testid="email"]') }
```

O getter é avaliado *lazy* (no momento em que é acessado), não na inicialização. Isso é fundamental para o Cypress, que usa uma fila de comandos assíncrona.

### Por que `.should('be.visible')` antes de cada interação?

```js
this.emailInput.should('be.visible').type(email)
```

Garante que o elemento está renderizado e visível *antes* de interagir. Sem isso, o Cypress pode tentar clicar em elementos que ainda estão sendo carregados, gerando falhas intermitentes (flaky tests). É uma boa prática de defesa contra race conditions no DOM.

---

## Custom Commands (`commands.js`)

Custom commands estendem o Cypress com comportamentos reutilizáveis que não pertencem a nenhuma Page específica.

### `cy.loginUI(email, password)`

```js
Cypress.Commands.add('loginUI', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('[data-testid="email"]').should('be.visible').type(email)
    cy.get('[data-testid="senha"]').should('be.visible').type(password, { parseSpecialCharSequences: false })
    cy.get('[data-testid="entrar"]').should('be.visible').click()
    cy.url().should('include', '/home')
  }, { cacheAcrossSpecs: true })
})
```

**Por que usar seletores diretos aqui em vez do LoginPage?**
Custom commands ficam numa camada abaixo do POM. Se `loginUI` importasse `LoginPage`, a dependência seria invertida (camada inferior dependendo da superior), podendo gerar imports circulares. Commands são utilitários autocontidos.

**Por que `cy.session`?**
`cy.session` armazena e restaura cookies/localStorage entre testes. Sem ele, cada `it` faria login completo via UI (lento). Com ele, o login real acontece uma única vez; os testes seguintes restauram a sessão em milissegundos.

**Por que `cacheAcrossSpecs: true`?**
Estende o cache da sessão para todos os spec files do run. Sem isso, o login seria refeito no início de cada spec file.

**Atenção: `cy.session` restaura cookies mas navega para `about:blank`.** Por isso sempre fazemos `cy.visit()` explícito no `beforeEach` após o login.

### `cy.loginAPI(email, password)`

```js
Cypress.Commands.add('loginAPI', (email, password) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/login`,
    body: { email, password },
  }).then(({ body }) => {
    expect(body).to.have.property('authorization')
    return body.authorization  // retorna o token via chain
  })
})
```

**Por que retornar o token via chain em vez de `Cypress.env()`?**
Armazenar em `Cypress.env()` é estado global mutável — perigoso em testes paralelos e difícil de rastrear. Retornar via chain força o caller a lidar com o valor de forma explícita e imediata.

### `cy.createProductAPI(overrides)`

```js
Cypress.Commands.add('createProductAPI', (overrides = {}) => {
  const product = {
    nome: overrides.nome ?? `${faker.commerce.productName()} ${Date.now()}`,
    preco: overrides.preco ?? faker.number.int({ min: 10, max: 1000 }),
    // ...
  }
  cy.loginAPI(...).then((token) => {
    return cy.request({ method: 'POST', ... }).then(({ body }) => ({ _id: body._id, nome: product.nome }))
  })
})
```

**Quando usar `createProductAPI` vs `cy.request` direto?**

| Situação | Abordagem |
|---|---|
| O produto é apenas **setup** para o teste real | `cy.createProductAPI()` |
| Estou **testando o endpoint de criação** em si | `cy.request()` direto |

A regra: se a criação do produto *é* o teste, use `cy.request`. Se o produto existe só para viabilizar outro teste, use o command.

---

## Setup Global (`e2e.js`)

```js
before(() => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/usuarios`,
    failOnStatusCode: false,
    body: {
      nome: 'Admin QA',
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
      administrador: 'true',
    },
  })
})
```

**Por que isso existe?**
ServeRest é uma API pública compartilhada. Qualquer pessoa pode deletar usuários. Credenciais hardcoded tornam o projeto frágil. A solução: gerar credenciais únicas a cada run e criar o usuário dinamicamente.

**Por que `failOnStatusCode: false`?**
O `before` roda antes de *cada* spec file. Na primeira spec, o usuário é criado (201). Nas specs seguintes, o mesmo email já existe e o ServeRest retorna 400. Com `failOnStatusCode: false`, o 400 é ignorado silenciosamente — o que importa é garantir que o usuário *exista*, não que *foi criado agora*.

**Resultado:** apenas 1 usuário admin é criado por run, independente de quantos spec files existam.

---

## Geração Dinâmica de Credenciais (`cypress.config.js`)

```js
setupNodeEvents(_on, config) {
  const ts = Date.now()
  config.env.adminEmail    = `admin_${ts}@qarun.com`
  config.env.adminPassword = 'Cypress@run1'
  return config  // obrigatório para as mudanças surtirem efeito
}
```

**Por que `setupNodeEvents` e não `beforeEach`/`before` no spec?**
`setupNodeEvents` roda **uma única vez em Node.js**, antes de qualquer spec ser carregada. Isso garante que o mesmo email é usado em todas as specs do run, permitindo que `cy.session` com `cacheAcrossSpecs: true` funcione corretamente (a chave de cache é o email + senha).

Se gerássemos no `before` de cada spec, cada spec teria um email diferente, quebrando o cache da sessão.

**Por que `return config` é obrigatório?**
Diferente de outras funções Cypress, `setupNodeEvents` precisa retornar o objeto `config` modificado. Sem o `return`, as mudanças em `config.env` são descartadas.

---

## JSON Schema Validation

### O que é

Schema validation verifica que o *contrato* da API não mudou — estrutura, tipos e campos obrigatórios estão corretos.

### Como implementamos

```js
import loginSchema from '../../support/schemas/login.schema.json'

cy.request({ method: 'POST', url: `${API}/login`, body: { ... } })
  .validateSchema(loginSchema)  // do cypress-ajv-schema-validator
  .then(({ status }) => {
    expect(status).to.eq(200)
  })
```

**Por que ES6 import em vez de `cy.fixture()`?**

```js
// ❌ cy.fixture — assíncrono, obriga a envolver tudo em .then()
cy.fixture('schemas/login.schema.json').then((schema) => {
  cy.request(...).validateSchema(schema)
})

// ✅ ES6 import — síncrono, direto, sem wrapper
import loginSchema from '../../support/schemas/login.schema.json'
cy.request(...).validateSchema(loginSchema)
```

**Por que os schemas ficam em `support/` e não em `fixtures/`?**
`fixtures/` é para dados de teste (mocks, payloads de request). Schemas são parte da infraestrutura de suporte dos testes, não dados. A separação segue o princípio de responsabilidade única.

**O que cada campo do schema faz:**

| Campo | Função |
|---|---|
| `type` | Valida o tipo (`object`, `string`, `integer`) |
| `required` | Garante que os campos existem no response |
| `properties` | Define restrições por campo |
| `additionalProperties: false` | Falha se o response tiver campos não mapeados |

Campos como `$schema` e `title` são apenas metadados — não afetam a validação.

---

## Testes de Roles (RBAC)

Testamos que cada papel (admin / usuário regular) tem acesso apenas ao que deveria ter.

### API

```js
// regular.cy.js — usuário regular não pode criar produto
it('should return 403 when trying to create a product', () => {
  cy.request({
    method: 'POST',
    url: `${API}/produtos`,
    headers: { Authorization: regularUserToken },
    failOnStatusCode: false,
  }).then(({ status, body }) => {
    expect(status).to.eq(403)
    expect(body).to.have.property('message', 'Rota exclusiva para administradores')
  })
})
```

**Por que usamos um ID falso (`fake-product-id`) nos testes de DELETE/PUT 403?**
O ServeRest verifica a autorização *antes* de buscar o recurso. Isso significa que a tentativa de deletar com um token de usuário regular retorna 403 independentemente de o produto existir ou não. Criar um produto real seria desperdício de setup — um ID fake funciona igualmente para testar a permissão.

### Frontend

```js
it('should not see admin controls', () => {
  AdminPage.shouldNotSeeAdminControls()
})
```

No frontend, validamos que a UI não exibe elementos de admin para usuários regulares — e que os links de admin não existem no DOM (`.should('not.exist')`), não apenas que estão ocultos (`.should('not.be.visible')`). A diferença importa: `not.exist` garante que o elemento não foi renderizado, não apenas escondido com CSS.

---

## Fluxo E2E de Produtos

O teste de produtos executa um fluxo híbrido por uma limitação conhecida da aplicação:

```
Criar via UI → Editar via API → Deletar via UI
```

**Por que editar via API?**
O botão "Editar" na lista de produtos do ServeRest tem um bug: não navega para a página de edição. Em vez de ignorar o cenário de edição, contornamos via API — o que também é uma prática válida em testes E2E quando a UI tem limitações conhecidas.

**Como encontramos o ID do produto criado pela UI?**

```js
cy.request('GET', `${API}/produtos?nome=${productName}`).then(({ body }) => {
  const productId = body.produtos[0]._id
  // ... PUT /produtos/:id
})
```

Após criar via UI, fazemos um GET filtrando pelo nome (único graças ao `Date.now()` no faker) para obter o `_id` e fazer o PUT.

---

## CI/CD (GitHub Actions)

```yaml
jobs:
  api-tests:      # roda em paralelo com frontend-tests
  frontend-tests: # roda em paralelo com api-tests
```

**Por que dois jobs paralelos?**
Reduz o tempo total de feedback. API tests são rápidos (~40s); frontend tests são mais lentos (~2min). Rodando em paralelo, o tempo total é o do job mais lento, não a soma dos dois.

**Por que `concurrency` + `cancel-in-progress: true`?**
Em times que fazem push frequente, evita que pipelines antigas continuem rodando quando já há uma nova versão. Economiza minutos de CI e feedback mais rápido.

**Por que apenas `CYPRESS_apiUrl` como secret?**
As credenciais de admin são geradas dinamicamente pelo `setupNodeEvents` — não precisam ser configuradas externamente. O único valor externo necessário é a URL da API, que pode mudar entre ambientes (staging, produção).

**Por que `CYPRESS_apiUrl` (camelCase) e não `CYPRESS_API_URL`?**
Cypress converte variáveis `CYPRESS_*` para lowercase com underscore: `CYPRESS_API_URL` → `api_url`. Como o código usa `Cypress.env('apiUrl')`, o nome da variável de ambiente precisa preservar o camelCase: `CYPRESS_apiUrl` → `apiUrl`. ✅

---

## Padrões e Convenções

### Nomear testes com "should"

```js
it('should return 401 when credentials are invalid', ...)
it('should redirect to home after login', ...)
```

"Should" deixa claro que é uma expectativa de comportamento, não uma descrição técnica. Facilita a leitura do relatório de testes por não-desenvolvedores.

### `before` vs `beforeEach`

| Hook | Quando usar |
|---|---|
| `before` | Setup que acontece uma vez para o bloco inteiro (criar usuário, obter token) |
| `beforeEach` | Estado que precisa ser restaurado antes de *cada* teste (navegar para a página, fazer login) |

### `after` para limpeza

```js
after(() => {
  cy.request({ method: 'DELETE', url: `${API}/usuarios/${regularUserId}` })
})
```

Usuários criados nos testes de roles são deletados no `after`. Isso mantém o ambiente limpo. Para o admin do run inteiro, não fazemos limpeza — ele expira naturalmente no ServeRest após algum tempo.

### Faker para dados dinâmicos

```js
const productName = `${faker.commerce.productName()} ${Date.now()}`
```

O `Date.now()` junto ao nome do faker garante unicidade absoluta, evitando colisões quando dois runs executam simultaneamente na mesma API pública.

---

## Resumo das Decisões de Arquitetura

| Decisão | Alternativa Descartada | Motivo |
|---|---|---|
| POM com getters JS | Propriedades diretas / métodos | Lazy evaluation necessária para o contexto assíncrono do Cypress |
| `cy.session` com `cacheAcrossSpecs` | Login em cada `beforeEach` | Performance — login via UI é lento (~3s); session restore é instantâneo |
| Credenciais geradas em `setupNodeEvents` | Hardcoded em `cypress.env.json` | API pública compartilhada — usuários podem ser deletados por terceiros |
| Schemas em `support/` | Schemas em `fixtures/` | Fixtures são dados de teste; schemas são infraestrutura de suporte |
| ES6 import para schemas | `cy.fixture().then()` | Evita wrapper assíncrono desnecessário |
| Jobs paralelos na CI | Job único sequencial | Reduz tempo de feedback; API e frontend são independentes |
| ID falso nos testes de 403 | Criar produto real como setup | ServeRest verifica auth antes do recurso — produto real é desnecessário |
