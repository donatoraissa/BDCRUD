const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/participacoes', (req, res) => {
  const { id_atleta, id_categoria, id_competicao, resultado, matricula } = req.body;

  if (!id_atleta || !id_categoria || !id_competicao || !resultado || !matricula) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios: id_atleta, id_categoria, id_competicao, resultado e matricula.' });
  }

  const stmt = db.prepare(`
    INSERT INTO Participacoes (id_atleta, id_categoria, id_competicao, resultado, matricula)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id_atleta, id_categoria, id_competicao, resultado, matricula, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar participação.' });
    }
    res.status(201).json({ message: 'Participação cadastrada com sucesso!', id: this.lastID });
  });

  stmt.finalize();
});

router.get('/participacoes/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM Participacoes WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar participação.' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Participação não encontrada.' });
    }

    res.status(200).json(row);
  });
});

router.get('/participacoes', (req, res) => {
  db.all('SELECT * FROM Participacoes', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar participações.' });
    }

    res.status(200).json(rows);
  });
});

router.delete('/participacoes/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM Participacoes WHERE id = ?');

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

module.exports = router;
