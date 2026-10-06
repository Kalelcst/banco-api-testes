const bcrypt = require('bcryptjs');


const senhaHash = bcrypt.hashSync('Senha@123', 8);

const usuarios = [
  {
    id: 1,
    cpf: '12345678900',
    email: 'cliente1@bancoteste.com',
    senha: senhaHash,
    nome: 'Cliente Um',
    saldo: 1500.0,
    limiteDiarioTransferencia: 2000.0,
    transferidoHoje: 0,
  },
  {
    id: 2,
    cpf: '98765432100',
    email: 'cliente2@bancoteste.com',
    senha: senhaHash,
    nome: 'Cliente Dois',
    saldo: 300.0,
    limiteDiarioTransferencia: 2000.0,
    transferidoHoje: 0,
  },
];

const codigosReset = {};

function buscarPorEmail(email) {
  return usuarios.find((u) => u.email === email);
}

function buscarPorId(id) {
  return usuarios.find((u) => u.id === id);
}

module.exports = {
  usuarios,
  codigosReset,
  buscarPorEmail,
  buscarPorId,
};
