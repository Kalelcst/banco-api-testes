const express = require('express');
const { autenticar } = require('../middleware/auth');
const { buscarPorId } = require('../database');

const router = express.Router();

router.get('/saldo', autenticar, (req, res) => {
  const usuario = buscarPorId(req.usuarioId);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  return res.status(200).json({ saldo: usuario.saldo });
});

router.post('/transferir', autenticar, (req, res) => {
  const { destinatarioId, valor } = req.body;
  const usuario = buscarPorId(req.usuarioId);
  const destinatario = buscarPorId(destinatarioId);

  if (!destinatario) {
    return res.status(404).json({ erro: 'Destinatário não encontrado' });
  }

  if (typeof valor !== 'number' || valor <= 0) {
    return res.status(400).json({ erro: 'Valor de transferência inválido' });
  }

  if (valor > usuario.saldo) {
    return res.status(400).json({ erro: 'Saldo insuficiente' });
  }

  if (usuario.transferidoHoje + valor > usuario.limiteDiarioTransferencia) {
    return res.status(400).json({ erro: 'Limite diário de transferência excedido' });
  }

  usuario.saldo -= valor;
  usuario.transferidoHoje += valor;
  destinatario.saldo += valor;

  return res.status(200).json({
    mensagem: 'Transferência realizada com sucesso',
    saldoAtual: usuario.saldo,
  });
});

module.exports = router;
