const dotenv = require('dotenv').config();
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const ScoreCandidates = require("./scorecandids.js");
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
module.exports = 
async function ScoreCandidatesDistributed(
  resume_url,
  job_requirement,
  maxretries = 3
) {
  for (let attempts = 0; attempts < maxretries; attempts++) {
    try {
      console.log("retry", attempts)
      const genAI = getNextGenAI();
      const result = await ScoreCandidates(resume_url, job_requirement, genAI);
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
          personal_information: {
            name: "error fetching name ",
            contact: "error fetching contact",
            email: "error fetching email",
          },
          suitability_rating: "error fetching rating please check the resume",
          reason: "error fetching reason please check the resume",
        }]
      }
    }
  }
};
// const resume_url = "https://drive.google.com/file/d/1aQXQLE8ZgvdgsLJ2OXkuH8Lb09lraWm4/edit";
// const job_requirement = `### Internship Opportunity at Studio Frontier

// #### About Studio Frontier
// Studio Frontier is a boutique software development studio based in Mumbai. We specialize in building custom applications for startups and scaleups, along with developing our in-house SaaS products. Our founders bring over a decade of industry experience.

// #### Internship Details

// **Position:** Software Development Intern  
// **Number of Openings:** 2  
// **Location:** Mumbai, Maharashtra

// #### Responsibilities
// As a selected intern, you will:
// 1. Work on our in-house products.
// 2. Engage in client projects.
// 3. Develop tools to enhance company operations.

// #### Skills Required
// - HTML
// - JavaScript
// - React
// - ReactJS


// #### Eligibility Criteria
// Only candidates who meet the following criteria can apply:
// 1. Available for a full-time (in-office) internship.
// 2. Can start the internship between 12th Jun'24 and 17th Jul'24.
// 3. Available for a duration of 3 months.
// 4. From or willing to relocate to Mumbai and neighboring cities.
// 5. Possess relevant skills and interests.

// **Preferred Background:** Computer Engineering students

// #### Perks
// - Certificate
// - Letter of recommendation
// - Informal dress code
// - 5-day work week`

// ScoreCandidatesDistributed(resume_url, job_requirement)