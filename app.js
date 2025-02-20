const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json());

const db = new sqlite3.Database('./jiujitsu.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Banco de dados SQLite conectado!');
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS Professores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf VARCHAR(14) UNIQUE NOT NULL,
      nome VARCHAR(100) NOT NULL,
      telefone VARCHAR(20),
      salario DECIMAL(10,2)
    )`, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela:', err);
    } else {
      console.log('Tabela "Professores" criada ou já existe.');
    }
  });

  // db.run(
  //   `CREATE TABLE Atletas (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     cpf VARCHAR(14) UNIQUE NOT NULL,
  //     nome VARCHAR(100) NOT NULL,
  //     data_nascimento DATE,
  //     endereco VARCHAR(255),
  //     telefone VARCHAR(20),
  //     peso_kg DECIMAL(5,2),
  //     categoria VARCHAR(50),
  //     faixa_atual VARCHAR(50),
  //     professor_id INT,
  //     FOREIGN KEY (professor_id) REFERENCES Professores(id)
  //   );`, (err) => {
  //   if (err) {
  //     console.error('Erro ao criar a tabela:', err);
  //   } else {
  //     console.log('Tabela "atletas" criada ou já existe.');
  //   }
  // });

  // db.run(
  //   `CREATE TABLE Progressoes (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     atleta_id INT NOT NULL,
  //     data_graduacao DATE NOT NULL,
  //     nova_faixa VARCHAR(50) NOT NULL,
  //     observacoes TEXT,
  //     FOREIGN KEY (atleta_id) REFERENCES Atletas(id)
  //   );`, (err) => {
  //   if (err) {
  //     console.error('Erro ao criar a tabela:', err);
  //   } else {
  //     console.log('Tabela "atletas" criada ou já existe.');
  //   }
  // });

  // db.run(
  //   `CREATE TABLE Competicoes (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     atleta_id INT NOT NULL,
  //     nome_competicao VARCHAR(100) NOT NULL,
  //     data DATE NOT NULL,
  //     categoria VARCHAR(50) NOT NULL,
  //     resultado VARCHAR(20),
  //     matricula_competicao INT UNIQUE,
  //     FOREIGN KEY (atleta_id) REFERENCES Atletas(id)
  //   );`, (err) => {
  //   if (err) {
  //     console.error('Erro ao criar a tabela:', err);
  //   } else {
  //     console.log('Tabela "atletas" criada ou já existe.');
  //   }
  // });

  // db.run(
  //   `CREATE TABLE Ranking (
  //     id INTEGER PRIMARY KEY AUTOINCREMENT,
  //     atleta_id INT NOT NULL,
  //     graduacao VARCHAR(50) NOT NULL,
  //     total_medalhas VARCHAR(20),
  //     participacoes INT NOT NULL,
  //     FOREIGN KEY (atleta_id) REFERENCES Atletas(id)
  //   );`, (err) => {
  //   if (err) {
  //     console.error('Erro ao criar a tabela:', err);
  //   } else {
  //     console.log('Tabela "atletas" criada ou já existe.');
  //   }
  // });
});

app.post('/professor', (req, res) => {
  const { cpf, nome, telefone, salario } = req.body;
  
  if (!cpf || !nome) {
    return res.status(400).json({ error: 'Os campos cpf e nome são obrigatórios!' });
  }

  const stmt = db.prepare(`
    INSERT INTO Professores (cpf, nome, telefone, salario)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(cpf, nome, telefone || null, salario || null, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar professor.' });
    }
    res.status(201).json({ message: 'Professor cadastrado com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar o banco de dados:', err);
    } else {
      console.log('Conexão com o banco de dados fechada.');
    }
    process.exit(0);
  });
});
