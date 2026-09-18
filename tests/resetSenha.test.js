const request = require('supertest');
const app = require('../src/app');

describe('POST /api/senha/reset/solicitar', () => {
  test('deve gerar um código para um e-mail cadastrado', async () => {
    const resposta = await request(app)
      .post('/api/senha/reset/solicitar')
      .send({ email: 'cliente2@bancoteste.com' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveProperty('codigoDebug');
    expect(resposta.body.codigoDebug).toHaveLength(6);
  });

  test('não deve revelar se o e-mail não existe na base (mesma mensagem genérica)', async () => {
    const resposta = await request(app)
      .post('/api/senha/reset/solicitar')
      .send({ email: 'naoexiste@bancoteste.com' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).not.toHaveProperty('codigoDebug');
  });

  test('deve retornar 400 se o email não for informado', async () => {
    const resposta = await request(app).post('/api/senha/reset/solicitar').send({});

    expect(resposta.status).toBe(400);
  });
});

describe('POST /api/senha/reset/confirmar', () => {
  const email = 'cliente2@bancoteste.com';

  test('deve retornar erro se não houver solicitação de reset prévia', async () => {
    const resposta = await request(app)
      .post('/api/senha/reset/confirmar')
      .send({ email: 'cliente1@bancoteste.com', codigo: '123456', novaSenha: 'NovaSenha123' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toMatch(/Nenhuma solicitação/);
  });

  test('deve rejeitar código incorreto', async () => {
    await request(app).post('/api/senha/reset/solicitar').send({ email });

    const resposta = await request(app)
      .post('/api/senha/reset/confirmar')
      .send({ email, codigo: '000000', novaSenha: 'NovaSenha123' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toBe('Código inválido');
  });

  test('deve rejeitar nova senha muito curta', async () => {
    const solicitar = await request(app).post('/api/senha/reset/solicitar').send({ email });
    const codigo = solicitar.body.codigoDebug;

    const resposta = await request(app)
      .post('/api/senha/reset/confirmar')
      .send({ email, codigo, novaSenha: '123' });

    expect(resposta.status).toBe(400);
  });

  test('deve trocar a senha com sucesso e permitir login com a nova senha', async () => {
    const solicitar = await request(app).post('/api/senha/reset/solicitar').send({ email });
    const codigo = solicitar.body.codigoDebug;

    const confirmar = await request(app)
      .post('/api/senha/reset/confirmar')
      .send({ email, codigo, novaSenha: 'SenhaNova@2024' });

    expect(confirmar.status).toBe(200);
    expect(confirmar.body.mensagem).toBe('Senha alterada com sucesso');

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, senha: 'SenhaNova@2024' });

    expect(login.status).toBe(200);
    expect(login.body).toHaveProperty('token');
  });
});
