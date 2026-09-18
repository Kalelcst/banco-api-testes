const express = require('express');
const authRoutes = require('./routes/auth');
const senhaRoutes = require('./routes/senha');
const contaRoutes = require('./routes/conta');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/senha', senhaRoutes);
app.use('/api/conta', contaRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API Banco Teste está no ar' });
});

module.exports = app;
