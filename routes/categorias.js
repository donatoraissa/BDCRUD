const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/categorias', (req, res) => {
    const { nome_categoria } = req.body;
  
    if (!nome_categoria) {
      return res.status(400).json({ error: 'O campo nome_categoria é obrigatório!' });
    }
  
    db.get('SELECT id FROM Categorias WHERE nome_categoria = ?', [nome_categoria], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar categoria.' });
      }
  
      if (row) {
        return res.status(400).json({ error: 'Essa categoria já está cadastrada!' });
      }
  
    
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
  

  router.get('/categoria/:id', (req, res) => {
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

  router.get('/categorias', (req, res) => {
    db.all('SELECT * FROM Categorias', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar categorias.' });
      }
  
      res.status(200).json(rows);
    });
  });
  

  router.put('/categorias/:id', (req, res) => {
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
  

  router.delete('/categorias/:id', (req, res) => {
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

  module.exports = router;