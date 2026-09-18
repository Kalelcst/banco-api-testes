const app = require('./src/app');

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
  console.log(`API Banco Teste rodando em http://localhost:${PORTA}`);
});
