const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
  test('deve autenticar com credenciais válidas e retornar um token', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente1@bancoteste.com', senha: 'Senha@123' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('token');
    expect(resposta.body.usuario.email).toBe('cliente1@bancoteste.com');
  });

  test('deve rejeitar login com senha incorreta', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente1@bancoteste.com', senha: 'senhaErrada123' });

    expect(resposta.status).toBe(401);
    expect(resposta.body.erro).toBe('Credenciais inválidas');
  });

  test('deve rejeitar login com e-mail não cadastrado', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@bancoteste.com', senha: 'Senha@123' });

    expect(resposta.status).toBe(401);
  });

  test('deve retornar erro 400 quando faltar email ou senha', async () => {
    const resposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente1@bancoteste.com' });

    expect(resposta.status).toBe(400);
  });
});

describe('Acesso a rota protegida (GET /api/conta/saldo)', () => {
  test('deve bloquear acesso sem token', async () => {
    const resposta = await request(app).get('/api/conta/saldo');

    expect(resposta.status).toBe(401);
  });

  test('deve bloquear acesso com token inválido', async () => {
    const resposta = await request(app)
      .get('/api/conta/saldo')
      .set('Authorization', 'Bearer token-invalido');

    expect(resposta.status).toBe(401);
  });

  test('deve permitir acesso com token válido obtido no login', async () => {
    const loginResposta = await request(app)
      .post('/api/auth/login')
      .send({ email: 'cliente1@bancoteste.com', senha: 'Senha@123' });

    const token = loginResposta.body.token;

    const resposta = await request(app)
      .get('/api/conta/saldo')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('saldo');
  });
});
