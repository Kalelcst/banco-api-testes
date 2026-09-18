let request;
let app;

// Reseta os módulos antes de cada teste para garantir que o "banco de dados"
// em memória comece do zero — evitando que um teste interfira no estado do outro.
beforeEach(() => {
  jest.resetModules();
  request = require('supertest');
  app = require('../src/app');
});

async function obterToken(email, senha) {
  const resposta = await request(app).post('/api/auth/login').send({ email, senha });
  return resposta.body.token;
}

describe('POST /api/conta/transferir', () => {
  test('deve realizar uma transferência válida entre contas', async () => {
    const token = await obterToken('cliente1@bancoteste.com', 'Senha@123');

    const resposta = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 2, valor: 100 });

    expect(resposta.status).toBe(200);
    expect(resposta.body.saldoAtual).toBe(1400);
  });

  test('deve rejeitar transferência com valor negativo', async () => {
    const token = await obterToken('cliente1@bancoteste.com', 'Senha@123');

    const resposta = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 2, valor: -50 });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Valor de transferência inválido');
  });

  test('deve rejeitar transferência com saldo insuficiente', async () => {
    const token = await obterToken('cliente2@bancoteste.com', 'Senha@123');

    const resposta = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 1, valor: 999999 });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Saldo insuficiente');
  });

  test('deve rejeitar transferência para destinatário inexistente', async () => {
    const token = await obterToken('cliente1@bancoteste.com', 'Senha@123');

    const resposta = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 999, valor: 10 });

    expect(resposta.status).toBe(404);
  });

  test('deve rejeitar transferência que ultrapasse o limite diário', async () => {
    // Aumentamos o saldo do usuário só para este teste, isolando a regra que
    // queremos validar (limite diário) da regra de saldo insuficiente.
    const database = require('../src/database');
    const usuario = database.buscarPorEmail('cliente1@bancoteste.com');
    usuario.saldo = 5000;

    const token = await obterToken('cliente1@bancoteste.com', 'Senha@123');

    // Consome quase todo o limite diário (limite = 2000)
    const primeiraTentativa = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 2, valor: 1900 });

    expect(primeiraTentativa.status).toBe(200);

    const segundaTentativa = await request(app)
      .post('/api/conta/transferir')
      .set('Authorization', `Bearer ${token}`)
      .send({ destinatarioId: 2, valor: 200 });

    expect(segundaTentativa.status).toBe(400);
    expect(segundaTentativa.body.erro).toBe('Limite diário de transferência excedido');
  });
});
