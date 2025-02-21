
const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/competicoes', (req, res) => {
    const { nome, data} = req.body;
  
    if (!nome || !data ) {
      return res.status(400).json({ error: 'Os campos nome e data' });
    }
  
    const stmt = db.prepare(`
      INSERT INTO Competicoes (nome, data)
      VALUES (?, ?)
    `);
  
    stmt.run(nome, data, function (err) {
      if (err) {
        return res.status(500).json({ error: 'Erro ao cadastrar competição.' });
      }
      res.status(201).json({ message: 'Competição cadastrada com sucesso!', id: this.lastID });
    });
  
    stmt.finalize();
  });
  
  router.get('/competicoes/:id', (req, res) => {
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
  
  router.get('/competicoes', (req, res) => {
    db.all('SELECT * FROM Competicoes', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar competições.' });
      }
  
      res.status(200).json(rows);
    });
  });
  
  router.delete('/competicoes/:id', (req, res) => {
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

  module.exports = router;