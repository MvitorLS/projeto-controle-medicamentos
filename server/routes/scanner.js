'use strict';

const express            = require('express');
const router             = express.Router();
const fs                 = require('fs');
const upload             = require('../upload');
const { parsePrescription } = require('../parser');

// POST /api/scanner
router.post('/', upload.single('receita'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const { path: filePath, mimetype } = req.file;

  try {
    let text = '';

    if (mimetype === 'application/pdf') {
      // PDF digital → extração direta de texto (alta precisão)
      const pdfParse = require('pdf-parse');
      const buffer   = fs.readFileSync(filePath);
      const result   = await pdfParse(buffer);
      text = result.text;
    } else {
      // Imagem → OCR com Tesseract.js (português + inglês)
      const { createWorker } = require('tesseract.js');
      const worker = await createWorker(['por', 'eng'], 1, { logger: () => {} });
      const { data } = await worker.recognize(filePath);
      text = data.text;
      await worker.terminate();
    }

    // Remove arquivo temporário
    fs.unlinkSync(filePath);

    if (!text || text.trim().length < 10) {
      return res.status(422).json({
        error: 'Não foi possível extrair texto. Para imagens, use fotos nítidas e bem iluminadas.',
      });
    }

    const medicamentos = parsePrescription(text);

    res.json({ medicamentos, linhas: text.split('\n').filter(Boolean).length });

  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('[Scanner]', err.message);
    res.status(500).json({ error: 'Erro ao processar o arquivo. Certifique-se de que é um arquivo legível.' });
  }
});

module.exports = router;
