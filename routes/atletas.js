const express = require('express');
const db = require('../database/db'); 
const router = express.Router();

router.post('/atletas', (req, res) => {
    const { cpf, nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor } = req.body;
  
    if (!cpf || !nome || !data_nascimento) {
      return res.status(400).json({ error: 'Os campos CPF, nome e data de nascimento são obrigatórios!' });
    }
  
    db.get('SELECT cpf FROM Atletas WHERE cpf = ?', [cpf], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar CPF do atleta.' });
      }
  
      if (row) {
        return res.status(400).json({ error: 'Este CPF já está cadastrado!' });
      }
  
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
  
  

  router.get('/atletas', (req, res) => {
    db.all('SELECT * FROM Atletas', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar atletas.' });
      }
  
      res.status(200).json(rows);
    });
  });

  router.get('/atletas/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM Atletas WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar atleta', details: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Atleta não encontrado' });
      }
      res.json(row);
    });
  });  

  router.delete('/atletas/:id', (req, res) => {
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
  
  router.put('/atletas/:id', (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, rua, numero, bairro, cidade, telefone, peso, id_categoria, id_faixa, id_professor } = req.body;
  
   
    let updateFields = [];
    let updateValues = [];
    

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

  
module.exports = router;
