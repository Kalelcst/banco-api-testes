const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { buscarPorEmail } = require('../database');
const { SEGREDO_JWT } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  const usuario = buscarPorEmail(email);

  if (!usuario) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaCorreta = bcrypt.compareSync(senha, usuario.senha);

  if (!senhaCorreta) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: usuario.id }, SEGREDO_JWT, { expiresIn: '1h' });

  return res.status(200).json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
});

module.exports = router;
