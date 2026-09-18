const express = require('express');
const bcrypt = require('bcryptjs');
const { buscarPorEmail, codigosReset } = require('../database');

const router = express.Router();

const VALIDADE_CODIGO_MS = 5 * 60 * 1000; // 5 minutos

function gerarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // código de 6 dígitos
}

// Etapa 1: solicitar o código de reset (simula envio por e-mail/SMS)
router.post('/reset/solicitar', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: 'Email é obrigatório' });
  }

  const usuario = buscarPorEmail(email);

  // Por segurança, não revelamos se o e-mail existe ou não na base.
  if (!usuario) {
    return res.status(200).json({
      mensagem: 'Se o e-mail existir, um código de verificação foi enviado.',
    });
  }

  const codigo = gerarCodigo();
  codigosReset[email] = {
    codigo,
    expiraEm: Date.now() + VALIDADE_CODIGO_MS,
  };

  // Em produção isso seria enviado por e-mail/SMS. Aqui devolvemos no
  // corpo da resposta só para viabilizar os testes automatizados.
  return res.status(200).json({
    mensagem: 'Se o e-mail existir, um código de verificação foi enviado.',
    codigoDebug: codigo,
  });
});

// Etapa 2: confirmar o código e definir a nova senha
router.post('/reset/confirmar', (req, res) => {
  const { email, codigo, novaSenha } = req.body;

  if (!email || !codigo || !novaSenha) {
    return res.status(400).json({ erro: 'Email, código e nova senha são obrigatórios' });
  }

  const registro = codigosReset[email];

  if (!registro) {
    return res.status(400).json({ erro: 'Nenhuma solicitação de reset encontrada para este e-mail' });
  }

  if (Date.now() > registro.expiraEm) {
    delete codigosReset[email];
    return res.status(400).json({ erro: 'Código expirado. Solicite um novo.' });
  }

  if (registro.codigo !== codigo) {
    return res.status(400).json({ erro: 'Código inválido' });
  }

  if (novaSenha.length < 8) {
    return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 8 caracteres' });
  }

  const usuario = buscarPorEmail(email);
  usuario.senha = bcrypt.hashSync(novaSenha, 8);
  delete codigosReset[email];

  return res.status(200).json({ mensagem: 'Senha alterada com sucesso' });
});

module.exports = router;
