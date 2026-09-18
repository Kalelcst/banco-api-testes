# Banco API Testes

![CI](https://github.com/Kalelcst/banco-api-testes/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green)
![Jest](https://img.shields.io/badge/tested%20with-Jest-C21325)
![Express](https://img.shields.io/badge/Express-4.x-black)

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

\`\`\`
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
\`\`\`

## Como rodar

\`\`\`bash
# instalar dependências
npm install

# rodar a API localmente (http://localhost:3000)
npm start

# rodar a suíte de testes
npm test

# rodar os testes com relatório de cobertura
npm run test:coverage
\`\`\`

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

> **Nota técnica:** os testes de