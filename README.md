# Banco API Testes

Projeto de portfólio de **automação de testes de API** simulando um cenário bancário
fictício. O objetivo é demonstrar testes automatizados de autenticação, reset de senha
e regras de negócio de um sistema financeiro (transferências, saldo, limites).

> ⚠️ Este é um projeto educacional/fictício. Não representa nenhuma instituição
> financeira real e não deve ser usado em produção.

## Cenário simulado

A API expõe um banco fictício com:

- **Autenticação (login)** via e-mail e senha, retornando um token JWT
- **Reset de senha** em duas etapas (solicitar código → confirmar código + nova senha)
- **Consulta de saldo** (rota protegida, exige token)
- **Transferência entre contas**, com validação de:
  - Valor inválido (negativo ou zero)
  - Saldo insuficiente
  - Limite diário de transferência excedido
  - Destinatário inexistente

Os dados ficam em memória (sem banco de dados real), o que facilita rodar os testes
sem dependências externas.

## Tecnologias

- **Node.js + Express** — API
- **JWT (jsonwebtoken)** — autenticação
- **bcryptjs** — hash de senhas
- **Jest** — test runner
- **Supertest** — testes de integração de API (requisições HTTP simuladas)
- **GitHub Actions** — CI, rodando os testes a cada push/PR

## Estrutura do projeto

```
banco-api-testes/
├── src/
│   ├── app.js              # Configuração da aplicação Express
│   ├── database.js         # "Banco de dados" em memória (usuários fictícios)
│   ├── middleware/
│   │   └── auth.js         # Middleware de verificação de JWT
│   └── routes/
│       ├── auth.js         # POST /api/auth/login
│       ├── senha.js        # POST /api/senha/reset/solicitar e /confirmar
│       └── conta.js        # GET /api/conta/saldo, POST /api/conta/transferir
├── tests/
│   ├── login.test.js       # Testes de login e acesso a rota protegida
│   ├── resetSenha.test.js  # Testes do fluxo de reset de senha
│   └── conta.test.js       # Testes de regras de negócio de transferência
├── server.js                # Ponto de entrada para rodar a API localmente
├── package.json
└── .github/workflows/ci.yml # Pipeline de CI
```

## Como rodar

```bash
# instalar dependências
npm install

# rodar a API localmente (http://localhost:3000)
npm start

# rodar a suíte de testes
npm test

# rodar os testes com relatório de cobertura
npm run test:coverage
```

## Usuários de teste (seed)

| E-mail                        | Senha        | Saldo inicial |
|--------------------------------|--------------|---------------|
| cliente1@bancoteste.com        | Senha@123    | R$ 1.500,00   |
| cliente2@bancoteste.com        | Senha@123    | R$ 300,00     |

## Casos de teste cobertos

**Login (`tests/login.test.js`)**
- Login com credenciais válidas
- Rejeição de senha incorreta
- Rejeição de e-mail não cadastrado
- Validação de campos obrigatórios
- Bloqueio de acesso a rota protegida sem token / com token inválido
- Acesso liberado com token válido

**Reset de senha (`tests/resetSenha.test.js`)**
- Geração de código para e-mail existente
- Mensagem genérica para e-mail inexistente (não vaza informação sobre a base)
- Validação de campo obrigatório
- Rejeição de código incorreto
- Rejeição de nova senha muito curta
- Fluxo completo: solicitar → confirmar → login com a nova senha

**Transferência (`tests/conta.test.js`)**
- Transferência válida entre contas
- Rejeição de valor negativo
- Rejeição por saldo insuficiente
- Rejeição por destinatário inexistente
- Rejeição por limite diário excedido

> **Nota técnica:** os testes de transferência usam `jest.resetModules()` para
> reiniciar o "banco de dados" em memória antes de cada teste. Isso evita que o
> resultado de um teste dependa da ordem de execução ou do estado deixado por
> outro teste — um problema comum (e sutil) em suítes de automação.

## Próximos passos (evolução do projeto)

- Adicionar autenticação de dois fatores (2FA) no login
- Persistir dados em um banco real (ex: SQLite/PostgreSQL) via Docker
- Adicionar testes de carga (ex: k6 ou Artillery)
- Gerar relatório visual com Allure
