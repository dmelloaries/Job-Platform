const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const axios = require('axios');

 module.exports = async function extractTextFromPDF(pdfPath) {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  }
