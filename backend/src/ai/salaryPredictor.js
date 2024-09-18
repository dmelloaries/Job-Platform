
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const  extractTextFromPDF  = require("./pdfParse.js");
const axios = require('axios');
const ConvertLink = require('./convertLink.js');
 
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ];
  
  async function downloadPDF(url, localPath) {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(localPath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
  // Parse the resume using the generative AI model
  
  module.exports =  async function ParseResume(resume_url,genAI) {
    const systemInstruction = "Review the Resume and suggest improvements .\nExpected json output:\n{\n \  \"domain\": \"\",\n   \"experience_years\": ,\n   \"Review\": ,\n  \"location\": \"\",\n  \"skills\": [\"skill1\", \"skill2\", \"skill3],\n  \"education\": \"\",\n  \"salary\": \"salary range here in INR\"\n}\n"
   const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
      systemInstruction,
    });

    const generationConfig = {
        temperature: 2,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        response_mime_type: "application/json"
      }
      console.log("resume_url",resume_url)
    const resume_url_updated = ConvertLink(resume_url)
    const fileName = `resume${Date.now()}.pdf`;
    const localPDFpath = path.join(__dirname,fileName);
    
    await downloadPDF(resume_url_updated, localPDFpath)
    console.log("downloaded")
    const resume = await extractTextFromPDF(localPDFpath)
    console.log("extracted")
    
    fs.unlinkSync(localPDFpath);


    const chatSession = model.startChat({
      generationConfig,
    });
    
    const prompt = `Resume:${resume}`

    const result = await chatSession.sendMessage(prompt);
    console.log(result.response.text())
    const jsonResult = JSON.parse(result.response.text());
   
    return jsonResult;
  }
  