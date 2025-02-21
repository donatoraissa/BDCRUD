const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const port = 3000;

app.use(express.json());
app.use(cors());

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

  db.run(`
    CREATE TABLE IF NOT EXISTS Categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_categoria VARCHAR(50) NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Categorias:', err);
    } else {
      console.log('Tabela "Categorias" criada ou já existe.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Faixas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_faixa VARCHAR(50) NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Faixas:', err);
    } else {
      console.log('Tabela "Faixas" criada ou já existe.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Atletas (
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
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Atletas:', err);
    } else {
      console.log('Tabela "Atletas" criada ou já existe.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Progressoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_atleta INTEGER,
      data_graduacao DATE NOT NULL,
      nova_faixa TEXT NOT NULL,
      observacao TEXT,
      FOREIGN KEY (id_atleta) REFERENCES Atletas(id)
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Progressoes:', err);
    } else {
      console.log('Tabela "Progressoes" criada ou já existe.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Competicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      data TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Competicoes:', err);
    } else {
      console.log('Tabela "Competicoes" criada ou já existe.');
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS Participacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_atleta TEXT NOT NULL, 
      id_competicao INTEGER NOT NULL,
      id_categoria INTEGER,
      resultado TEXT,
      matricula TEXT,
      FOREIGN KEY (id_atleta) REFERENCES Atletas(cpf) ON DELETE CASCADE,
      FOREIGN KEY (id_competicao) REFERENCES Competicoes(id) ON DELETE CASCADE,
      FOREIGN KEY (id_categoria) REFERENCES Categorias(id) ON DELETE SET NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Participacoes:', err);
    } else {
      console.log('Tabela "Participacoes" criada ou já existe.');
    }
  });

  // Adicionando a tabela de Ranking
  db.run(`
    CREATE TABLE IF NOT EXISTS Ranking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      id_atleta INTEGER NOT NULL,
      total_medalhas INTEGER DEFAULT 0,
      total_participacoes INTEGER DEFAULT 0,
      FOREIGN KEY (id_atleta) REFERENCES Atletas(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Ranking:', err);
    } else {
      console.log('Tabela "Ranking" criada ou já existe.');
    }
  });
});


app.post('/professor', (req, res) => {
  const { cpf, nome, telefone, salario } = req.body;
  
  if (!cpf || !nome) {
    return res.status(400).json({ error: 'Os campos cpf e nome são obrigatórios!' });
  }

  db.get('SELECT id FROM Professores WHERE cpf = ?', [cpf], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar CPF.' });
    }

    if (row) {
      return res.status(400).json({ error: 'Este CPF já está cadastrado!' });
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
});

app.get('/professor/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Professores WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar o professor.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Professor não encontrado.' });
    }

    res.status(200).json(row);
  });
});

app.get('/professores', (req, res) => {
  db.all('SELECT * FROM Professores', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar professores.' });
    }

    res.status(200).json(rows);
  });
});

app.put('/professor/:id', (req, res) => {
  const { id } = req.params;
  const { cpf, nome, telefone, salario } = req.body;

  if (!cpf || !nome) {
    return res.status(400).json({ error: 'Os campos cpf e nome são obrigatórios!' });
  }

  const stmt = db.prepare(`
    UPDATE Professores 
    SET cpf = ?, nome = ?, telefone = ?, salario = ?
    WHERE id = ?
  `);

  stmt.run(cpf, nome, telefone || null, salario || null, id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar professor.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Professor não encontrado.' });
    }

    res.json({ message: 'Professor atualizado com sucesso!' });
  });

  stmt.finalize();
});

app.delete('/professor/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Professores WHERE id = ?`);
  
  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir o professor.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Professor não encontrado.' });
    }

    res.status(200).json({ message: 'Professor excluído com sucesso!' });
  });

  stmt.finalize();
});

// Criar uma categoria
app.post('/categoria', (req, res) => {
  const { nome_categoria } = req.body;

  if (!nome_categoria) {
    return res.status(400).json({ error: 'O campo nome_categoria é obrigatório!' });
  }

  // Verifica se a categoria já existe no banco
  db.get('SELECT id FROM Categorias WHERE nome_categoria = ?', [nome_categoria], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar categoria.' });
    }

    if (row) {
      return res.status(400).json({ error: 'Essa categoria já está cadastrada!' });
    }

    // Se não existir, insere no banco
    const stmt = db.prepare(`INSERT INTO Categorias (nome_categoria) VALUES (?)`);
    stmt.run(nome_categoria, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao cadastrar categoria.' });
      }
      res.status(201).json({ message: 'Categoria cadastrada com sucesso!', id: this.lastID });
    });

    stmt.finalize();
  });
});


// Buscar uma categoria pelo ID
app.get('/categoria/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Categorias WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar categoria.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    res.status(200).json(row);
  });
});

// Listar todas as categorias
app.get('/categorias', (req, res) => {
  db.all('SELECT * FROM Categorias', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }

    res.status(200).json(rows);
  });
});

// Atualizar uma categoria
app.put('/categoria/:id', (req, res) => {
  const { id } = req.params;
  const { nome_categoria } = req.body;

  if (!nome_categoria) {
    return res.status(400).json({ error: 'O campo descrição é obrigatório!' });
  }

  const stmt = db.prepare(`UPDATE Categorias SET nome_categoria = ? WHERE id = ?`);

  stmt.run(nome_categoria, id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar categoria.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    res.json({ message: 'Categoria atualizada com sucesso!' });
  });

  stmt.finalize();
});

// Excluir uma categoria
app.delete('/categoria/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Categorias WHERE id = ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir a categoria.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    res.status(200).json({ message: 'Categoria excluída com sucesso!' });
  });

  stmt.finalize();
});
// Criar uma faixa
app.post('/faixa', (req, res) => {
  const { nome_faixa } = req.body;

  if (!nome_faixa) {
    return res.status(400).json({ error: 'O campo descrição é obrigatório!' });
  }

  const stmt = db.prepare(`INSERT INTO Faixas (nome_faixa) VALUES (?)`);

  stmt.run(nome_faixa, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar faixa.' });
    }
    res.status(201).json({ message: 'Faixa cadastrada com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

// Buscar uma faixa pelo ID
app.get('/faixa/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Faixas WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar faixa.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Faixa não encontrada.' });
    }

    res.status(200).json(row);
  });
});

// Listar todas as faixas
app.get('/faixas', (req, res) => {
  db.all('SELECT * FROM Faixas', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar faixas.' });
    }

    res.status(200).json(rows);
  });
});

// Atualizar uma faixa
app.put('/faixa/:id', (req, res) => {
  const { id } = req.params;
  const { nome_faixa } = req.body;

  if (!nome_faixa) {
    return res.status(400).json({ error: 'O campo descrição é obrigatório!' });
  }

  const stmt = db.prepare(`UPDATE Faixas SET nome_faixa = ? WHERE id = ?`);

  stmt.run(nome_faixa, id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar faixa.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Faixa não encontrada.' });
    }

    res.json({ message: 'Faixa atualizada com sucesso!' });
  });

  stmt.finalize();
});

// Excluir uma faixa
app.delete('/faixa/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Faixas WHERE id = ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir a faixa.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Faixa não encontrada.' });
    }

    res.status(200).json({ message: 'Faixa excluída com sucesso!' });
  });

  stmt.finalize();
});
// Criar um atleta
app.post('/atleta', (req, res) => {
  const { cpf, nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor } = req.body;

  if (!cpf || !nome || !data_nascimento) {
    return res.status(400).json({ error: 'Os campos CPF, nome e data de nascimento são obrigatórios!' });
  }

  // Verifica se o CPF já está cadastrado
  db.get('SELECT cpf FROM Atletas WHERE cpf = ?', [cpf], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao verificar CPF do atleta.' });
    }

    if (row) {
      return res.status(400).json({ error: 'Este CPF já está cadastrado!' });
    }

    // Se não existir, insere no banco
    const stmt = db.prepare(`
      INSERT INTO Atletas (cpf, nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(cpf, nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao cadastrar atleta.' });
      }
      res.status(201).json({ message: 'Atleta cadastrado com sucesso!', cpf: cpf });
    });

    stmt.finalize();
  });
});


// Listar todos os atletas
app.get('/atletas', (req, res) => {
  db.all('SELECT * FROM Atletas', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar atletas.' });
    }

    res.status(200).json(rows);
  });
});

// Excluir um atleta
app.delete('/atleta/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Atletas WHERE id= ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir o atleta.' });
    }

    res.status(200).json({ message: 'Atleta excluído com sucesso!' });
  });

  stmt.finalize();
});

app.put('/atleta/:id', (req, res) => {
  const { id } = req.params;  // Recebe o ID na URL
  const { nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor } = req.body;

  // Construir a atualização dinâmica com base nos campos enviados
  let updateFields = [];
  let updateValues = [];
  
  // Adicionar campos que não são nulos ou indefinidos
  if (nome) {
    updateFields.push('nome = ?');
    updateValues.push(nome);
  }
  if (data_nascimento) {
    updateFields.push('data_nascimento = ?');
    updateValues.push(data_nascimento);
  }
  if (rua) {
    updateFields.push('rua = ?');
    updateValues.push(rua);
  }
  if (numero) {
    updateFields.push('numero = ?');
    updateValues.push(numero);
  }
  if (bairro) {
    updateFields.push('bairro = ?');
    updateValues.push(bairro);
  }
  if (cidade) {
    updateFields.push('cidade = ?');
    updateValues.push(cidade);
  }
  if (telefone) {
    updateFields.push('telefone = ?');
    updateValues.push(telefone);
  }
  if (peso) {
    updateFields.push('peso = ?');
    updateValues.push(peso);
  }
  if (id_categoria) {
    updateFields.push('id_categoria = ?');
    updateValues.push(id_categoria);
  }
  if (id_faixa) {
    updateFields.push('id_faixa = ?');
    updateValues.push(id_faixa);
  }
  if (id_professor) {
    updateFields.push('id_professor = ?');
    updateValues.push(id_professor);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização!' });
  }

  updateValues.push(id);

  const updateQuery = `UPDATE Atletas SET ${updateFields.join(', ')} WHERE id = ?`;

  const stmt = db.prepare(updateQuery);

  stmt.run(updateValues, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar o atleta.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Atleta não encontrado.' });
    }

    res.json({ message: 'Atleta atualizado com sucesso!' });
  });

  stmt.finalize();
});
app.post('/progressoes', (req, res) => {
  const { id_atleta, data_graduacao, nova_faixa, observacao } = req.body;

  if (!id_atleta || !data_graduacao || !nova_faixa) {
    return res.status(400).json({ error: 'Os campos id_atleta, data_graduacao e nova_faixa são obrigatórios!' });
  }

  const stmt = db.prepare(`
    INSERT INTO Progressoes (id_atleta, data_graduacao, nova_faixa, observacao)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id_atleta, data_graduacao, nova_faixa, observacao || null, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar progressão.' });
    }
    res.status(201).json({ message: 'Progressão cadastrada com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

app.get('/progressoes', (req, res) => {
  db.all('SELECT * FROM Progressoes', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar progressões.' });
    }

    res.status(200).json(rows);
  });
});
app.get('/progressoes/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM Progressoes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar a progressão.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Progressão não encontrada.' });
    }

    res.status(200).json(row);
  });
});
app.put('/progressoes/:id', (req, res) => {
  const { id } = req.params;
  const { id_atleta, data_graduacao, nova_faixa, observacao } = req.body;

  let updateFields = [];
  let updateValues = [];

  if (id_atleta) {
    updateFields.push('id_atleta = ?');
    updateValues.push(id_atleta);
  }
  if (data_graduacao) {
    updateFields.push('data_graduacao = ?');
    updateValues.push(data_graduacao);
  }
  if (nova_faixa) {
    updateFields.push('nova_faixa = ?');
    updateValues.push(nova_faixa);
  }
  if (observacao) {
    updateFields.push('observacao = ?');
    updateValues.push(observacao);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização!' });
  }

  updateValues.push(id);

  const updateQuery = `UPDATE Progressoes SET ${updateFields.join(', ')} WHERE id = ?`;

  const stmt = db.prepare(updateQuery);
  
  stmt.run(updateValues, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar progressão.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Progressão não encontrada.' });
    }

    res.json({ message: 'Progressão atualizada com sucesso!' });
  });

  stmt.finalize();
});
app.delete('/progressoes/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM Progressoes WHERE id = ?');
  
  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir progressão.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Progressão não encontrada.' });
    }

    res.status(200).json({ message: 'Progressão excluída com sucesso!' });
  });

  stmt.finalize();
});

// Criar um Ranking
app.post('/ranking', (req, res) => {
  const { nome_ranking, descricao } = req.body;

  if (!nome_ranking || !descricao) {
    return res.status(400).json({ error: 'Os campos nome_ranking e descricao são obrigatórios!' });
  }

  const stmt = db.prepare(`
    INSERT INTO Rankings (nome_ranking, descricao)
    VALUES (?, ?)
  `);

  stmt.run(nome_ranking, descricao, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar ranking.' });
    }
    res.status(201).json({ message: 'Ranking cadastrado com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

// Buscar um Ranking pelo ID
app.get('/ranking/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Rankings WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar ranking.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Ranking não encontrado.' });
    }

    res.status(200).json(row);
  });
});

// Listar todos os Rankings
app.get('/rankings', (req, res) => {
  db.all('SELECT * FROM Rankings', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar rankings.' });
    }

    res.status(200).json(rows);
  });
});

// Atualizar um Ranking
app.put('/ranking/:id', (req, res) => {
  const { id } = req.params;
  const { nome_ranking, descricao } = req.body;

  if (!nome_ranking || !descricao) {
    return res.status(400).json({ error: 'Os campos nome_ranking e descricao são obrigatórios!' });
  }

  const stmt = db.prepare(`
    UPDATE Rankings SET nome_ranking = ?, descricao = ? WHERE id = ?
  `);

  stmt.run(nome_ranking, descricao, id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar ranking.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ranking não encontrado.' });
    }

    res.json({ message: 'Ranking atualizado com sucesso!' });
  });

  stmt.finalize();
});

// Excluir um Ranking
app.delete('/ranking/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Rankings WHERE id = ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir o ranking.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Ranking não encontrado.' });
    }

    res.status(200).json({ message: 'Ranking excluído com sucesso!' });
  });

  stmt.finalize();
});

// Criar uma Competição
app.post('/competicao', (req, res) => {
  const { nome, data, id_categoria, id_professor } = req.body;

  if (!nome || !data || !id_categoria || !id_professor) {
    return res.status(400).json({ error: 'Os campos nome, data, id_categoria e id_professor são obrigatórios!' });
  }

  const stmt = db.prepare(`
    INSERT INTO Competicoes (nome, data, id_categoria, id_professor)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(nome, data, id_categoria, id_professor, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar competição.' });
    }
    res.status(201).json({ message: 'Competição cadastrada com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

// Buscar uma Competição pelo ID
app.get('/competicao/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Competicoes WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar competição.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Competição não encontrada.' });
    }

    res.status(200).json(row);
  });
});

// Listar todas as Competições
app.get('/competicoes', (req, res) => {
  db.all('SELECT * FROM Competicoes', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar competições.' });
    }

    res.status(200).json(rows);
  });
});

// Excluir uma Competição
app.delete('/competicao/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Competicoes WHERE id = ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir a competição.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Competição não encontrada.' });
    }

    res.status(200).json({ message: 'Competição excluída com sucesso!' });
  });

  stmt.finalize();
});

// Criar uma Participação
app.post('/participacao', (req, res) => {
  const { id_atleta, id_competicao, colocacao, observacao } = req.body;

  if (!id_atleta || !id_competicao || !colocacao) {
    return res.status(400).json({ error: 'Os campos id_atleta, id_competicao e colocacao são obrigatórios!' });
  }

  const stmt = db.prepare(`
    INSERT INTO Participacoes (id_atleta, id_competicao, colocacao, observacao)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(id_atleta, id_competicao, colocacao, observacao || null, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar participação.' });
    }
    res.status(201).json({ message: 'Participação cadastrada com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

// Buscar uma Participação pelo ID
app.get('/participacao/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM Participacoes WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar participação.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Participação não encontrada.' });
    }

    res.status(200).json(row);
  });
});

// Listar todas as Participações
app.get('/participacoes', (req, res) => {
  db.all('SELECT * FROM Participacoes', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar participações.' });
    }

    res.status(200).json(rows);
  });
});

// Excluir uma Participação
app.delete('/participacao/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`DELETE FROM Participacoes WHERE id = ?`);

  stmt.run(id, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir a participação.' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Participação não encontrada.' });
    }

    res.status(200).json({ message: 'Participação excluída com sucesso!' });
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
