const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = require('./database/db'); 

const professoresRoutes = require('./routes/professores');
const categoriasRoutes = require('./routes/categorias');
const faixasRoutes = require('./routes/faixas');
const atletasRoutes = require('./routes/atletas');
const progressoesRoutes = require('./routes/progressoes');
const competicoesRoutes = require('./routes/competicoes');
const participacoesRoutes = require('./routes/participacoes');

const app = express();

const cors = require('cors');
const port = 3000;

app.use(express.json());
app.use(cors());

app.use('/api', professoresRoutes);
app.use('/api', categoriasRoutes);
app.use('/api', faixasRoutes);
app.use('/api', atletasRoutes);
app.use('/api', progressoesRoutes);
app.use('/api', competicoesRoutes);
app.use('/api', participacoesRoutes);

app.get('/', (req, res) => {
  res.send('API do sistema de gerenciamento de Jiu-Jitsu está rodando!');
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

