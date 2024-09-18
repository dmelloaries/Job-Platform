const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const axios = require('axios');


module.exports = function ConvertLink(viewableLink) {
    const baseUrl = 'https://drive.google.com/uc?export=download&id=';
    const regexFile = /\/d\/([^\/]+)/;
    const regexOpen = /open\?id=([^&]+)/;
   console.log("viewableLink ",viewableLink)
    let match = viewableLink.match(regexFile);

    if (!match) {
        match = viewableLink.match(regexOpen);
      
    }
    
  
    if (match && match[1]) {
      const fileId = match[1];
      console.log(`${baseUrl}${fileId}`)
      return `${baseUrl}${fileId}`;
    } else {
      throw new Error('Invalid Google Drive URL');
    }
  }