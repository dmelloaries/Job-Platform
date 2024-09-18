const dotenv = require('dotenv').config();
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const ParseResume = require("./salaryPredictor.js");
  console.log(process.env.API_KEY_1);
  const genAIInstances = [
    new GoogleGenerativeAI(process.env.API_KEY_1),
    // new GoogleGenerativeAI(process.env.API_KEY_2),
    // new GoogleGenerativeAI(process.env.API_KEY_3),
    // new GoogleGenerativeAI(process.env.API_KEY_4),
    // new GoogleGenerativeAI(process.env.API_KEY_5),
    // new GoogleGenerativeAI(process.env.API_KEY_6),
    // new GoogleGenerativeAI(process.env.API_KEY_7),
    // new GoogleGenerativeAI(process.env.API_KEY_8),
  ];
  
  let currentGenAIIndex = 0;
  // Create a function to get the next available AI instance

  function getNextGenAI() {
    const genAI = genAIInstances[currentGenAIIndex];
    currentGenAIIndex = (currentGenAIIndex + 1) % genAIInstances.length;
  
    //   if (genAI[apikey] || genAI.GoogleGenerativeAI.apikey) {
    //       console.log(genAI[apikey] + "brackets")
    //       console.log(genAI.GoogleGenerativeAI.apikey +"nobrackets")
    //   }
    return genAI;
  }


// Distribute the resume parsing task across multiple AI instances
async function ParseResumeDistributed(
    resume_url,
    maxretries = 3
  ) {
    for (let attempts = 0; attempts < maxretries; attempts++) {
      try {
        console.log("retry", attempts)
        const genAI = getNextGenAI();
        const result = await ParseResume(resume_url, genAI);
        console.log("result",result);
        return result;
      } catch (error) {
        if (error) {
          console.log("retry error ", error)
          console.log(
            `Retry attempt ${attempts + 1} due to error`
          );
          continue;
        }
        else {
          return [
            {
                error: "Failed to parse resume",
          }]
        }
      }
    }
  };

module.exports = { ParseResumeDistributed };