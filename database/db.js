const sqlite3 = require('sqlite3').verbose();

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
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_categoria VARCHAR(50) NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Faixas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_faixa VARCHAR(50) NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Atletas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf VARCHAR(14) UNIQUE NOT NULL,
      nome VARCHAR(100) NOT NULL,
      data_nascimento DATE NOT NULL,
      rua VARCHAR(100),
      numero VARCHAR(10),
      bairro VARCHAR(50),
      cidade VARCHAR(50),
      telefone VARCHAR(20),
      peso DECIMAL(5,2),
      id_categoria INTEGER,
      id_faixa INTEGER,
      id_professor INTEGER,
      FOREIGN KEY (id_categoria) REFERENCES Categorias(id),
      FOREIGN KEY (id_faixa) REFERENCES Faixas(id),
      FOREIGN KEY (id_professor) REFERENCES Professores(id)
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Progressoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_atleta INTEGER,
      data_graduacao DATE NOT NULL,
      nova_faixa TEXT NOT NULL,
      observacao TEXT,
    FOREIGN KEY (id_atleta) REFERENCES Atletas(id) ON DELETE CASCADE
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Competicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS Participacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_atleta TEXT NOT NULL, 
      id_competicao INTEGER NOT NULL,
      id_categoria INTEGER,
      resultado TEXT,
      matricula TEXT,
      FOREIGN KEY (id_atleta) REFERENCES Atletas(cpf) ON DELETE CASCADE,
      FOREIGN KEY (id_competicao) REFERENCES Competicoes(id) ON DELETE CASCADE,
      FOREIGN KEY (id_categoria) REFERENCES Categorias(id) ON DELETE SET NULL
    )`
  );
});

// Captura o sinal de interrupção (Ctrl + C) e fecha a conexão com o banco
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

module.exports = db;
