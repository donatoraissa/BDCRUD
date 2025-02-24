const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/progressoes', (req, res) => {
    const { id_atleta, data_graduacao, nova_faixa, observacao } = req.body;
  
    if (!id_atleta || !data_graduacao || !nova_faixa) {
      return res.status(400).json({ error: 'Os campos id_atleta, data_graduacao e nova_faixa são obrigatórios!' });
    }
  
    db.get('SELECT id FROM Atletas WHERE id = ?', [id_atleta], (err, atleta) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar o atleta.', details: err.message });
      }
  
      if (!atleta) {
        return res.status(404).json({ error: 'Atleta não encontrado!' });
      }
  
      // ✅ Se o atleta existir, insere a progressão
      const stmt = db.prepare(`
        INSERT INTO Progressoes (id_atleta, data_graduacao, nova_faixa, observacao)
        VALUES (?, ?, ?, ?)
      `);
  
      stmt.run(id_atleta, data_graduacao, nova_faixa, observacao || null, function (err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao cadastrar progressão.', details: err.message });
        }
        res.status(201).json({ message: 'Progressão cadastrada com sucesso!', id: this.lastID });
      });
  
      stmt.finalize();
    });
  });
  
  
  router.get('/progressoes', (req, res) => {
    db.all('SELECT * FROM Progressoes', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar progressões.' });
      }
  
      res.status(200).json(rows);
    });
  });

  router.get('/progressoes/:id', (req, res) => {
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

  router.put('/progressoes/:id', (req, res) => {
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

  router.delete('/progressoes/:id', (req, res) => {
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

  module.exports = router;
