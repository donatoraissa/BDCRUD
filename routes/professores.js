const express = require('express');
const db = require('../database/db'); 
const router = express.Router();


router.post('/professores', (req, res) => {
  const { cpf, nome, telefone, salario } = req.body;
  
  if (!cpf || !nome) {
    return res.status(400).json({ error: 'CPF e nome são obrigatórios.' });
  }

  db.run(
    'INSERT INTO Professores (cpf, nome, telefone, salario) VALUES (?, ?, ?, ?)',
    [cpf, nome, telefone, salario],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao adicionar professor', details: err.message });
      }
      res.status(201).json({ message: 'Professor adicionado', id: this.lastID });
    }
  );
});


router.get('/professores', (req, res) => {
  db.all('SELECT * FROM Professores', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar professores', details: err.message });
    }
    res.json(rows);
  });
});


router.get('/professores/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM Professores WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar professor', details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.json(row);
  });
});


router.put('/professores/:id', (req, res) => {
  const { id } = req.params;
  const { cpf, nome, telefone, salario } = req.body;

  db.run(
    'UPDATE Professores SET cpf = ?, nome = ?, telefone = ?, salario = ? WHERE id = ?',
    [cpf, nome, telefone, salario, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao atualizar professor', details: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Professor não encontrado' });
      }
      res.json({ message: 'Professor atualizado' });
    }
  );
});


router.delete('/professores/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM Professores WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao excluir professor', details: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Professor não encontrado' });
    }
    res.json({ message: 'Professor removido' });
  });
});

module.exports = router;
