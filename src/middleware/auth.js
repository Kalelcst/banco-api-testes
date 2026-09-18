const jwt = require('jsonwebtoken');

const SEGREDO_JWT = process.env.JWT_SECRET || 'segredo-de-teste-nao-usar-em-producao';

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, SEGREDO_JWT);
    req.usuarioId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = { autenticar, SEGREDO_JWT };
