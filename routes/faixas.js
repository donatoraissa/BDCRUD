const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/faixas', (req, res) => {
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
  

  router.get('/faixas/:id', (req, res) => {
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
  

  router.get('/faixas', (req, res) => {
    db.all('SELECT * FROM Faixas', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar faixas.' });
      }
  
      res.status(200).json(rows);
    });
  });
  
  router.delete('/faixas/:id', (req, res) => {
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

  
module.exports = router;