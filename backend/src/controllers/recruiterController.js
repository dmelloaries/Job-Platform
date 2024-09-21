const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");
const ScoreCandidatesDistributed = require("../ai/filtering/FilterDistributor.js");
const percentageFilter = require("../ai/filtering/percentageFilter.js");
const getAccessToken = require("../ai/scheduling/getToken.js");
const { bulkScheduleMeetings } = require("../ai/scheduling/calendly.js");
const ensureEventType = require("../ai/scheduling/CheckCreateEvent.js");
const { google } = require('googleapis'); 
const OAuth2 = google.auth.OAuth2;

// Create a job, with recruiterId fetched from the authenticated user
exports.createJob = async (req, res) => {
  const { companyname, title, description, location, salary } = req.body; // Destructure companyname from req.body

  try {
    const recruiterId = req.user.id; // Use recruiter ID from JWT token

    const job = await prisma.job.create({
      data: {
        companyname,  // Ensure companyname is passed here
        title,
        description,
        location,
        salary,
        recruiterId,  // Retrieved from JWT token
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error creating job:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get jobs list created by the recruiter
exports.getJobs = async (req, res) => {
  const recruiterId = req.user.id;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        recruiterId,
      },
    });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this recruiter." });
    }

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get applicants for a specific job
exports.getApplicants = async (req, res) => {
  const { jobId } = req.body;

  // Validate jobId
  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required." });
  }

  try {
    const applicants = await prisma.application.findMany({
      where: { jobId: parseInt(jobId, 10) }, // Ensure jobId is a number
      include: {
        job: { select: { title: true, description: true } }, // Include job title and description
        applicant: true, // Include associated applicant data
      },
    });

    if (applicants.length === 0) {
      return res
        .status(404)
        .json({ message: "No applicants found for this job." });
    }

    // Structured the response
    const jobInfo = {
      title: applicants[0].job.title,
      description: applicants[0].job.description,
    };

    const formattedApplicants = applicants.map((applicant) => ({
      id: applicant.applicant.id,
      name: applicant.applicant.name,
      email: applicant.applicant.email,
      resume: applicant.applicant.resume,
      resumeOriginalName: applicant.applicant.resumeOriginalName,
      bio: applicant.applicant.bio,
      skills: applicant.applicant.skills,
      profilePhoto: applicant.applicant.profilePhoto,
    }));

    const result = await Promise.all(
      formattedApplicants.map(async (applicant) => {
        const resume_url = applicant.resume;
        const job_requirement = jobInfo.description;
        const score = await ScoreCandidatesDistributed(
          resume_url,
          job_requirement
        );
        return score;
      })
    );
    res.json({ job: jobInfo, applicants: formattedApplicants, result });
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getFilteredApplicants = async (req, res) => {
  const { jobId, percentage } = req.body;
   
  // Validate jobId
  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required." });
  }

  try {
    const applicants = await prisma.application.findMany({
      where: { jobId: parseInt(jobId, 10) }, // Ensure jobId is a number
      include: {
        job: { select: { title: true, description: true } }, // Include job title and description
        applicant: true, // Include associated applicant data
      },
    });
      // console.log("applicants",applicants)
    if (applicants.length === 0) {
      return res
        .status(404)
        .json({ message: "No applicants found for this job." });
    }

    // Structured the response
    const jobInfo = {
      title: applicants[0].job.title,
      description: applicants[0].job.description,
    };

    const formattedApplicants = applicants
  .filter((applicant) => applicant.applicant.resume !== 'https://example.com/uploads/resume.pdf') // Filter out applicants with the specific resume URL
  .map((applicant) => ({
    id: applicant.applicant.id,
    name: applicant.applicant.name,
    email: applicant.applicant.email,
    resume: applicant.applicant.resume,
    resumeOriginalName: applicant.applicant.resumeOriginalName,
    bio: applicant.applicant.bio,
    skills: applicant.applicant.skills,
    profilePhoto: applicant.applicant.profilePhoto,
  }));


    console.log(formattedApplicants);
    
    // const percentage = 50;

    const result = await Promise.all(
      formattedApplicants.map(async (applicant) => {
        const resume_url = applicant.resume;
        const job_requirement = jobInfo.description;
        const score = await ScoreCandidatesDistributed(
          resume_url,
          job_requirement
        );
        //inserting applicant id in the score object
        score.applicantId = applicant.id;
        return score;
      })
    );

    const filteredApplicants = await percentageFilter(result, percentage);

    if (result) {
      res.json({
        job: jobInfo,
        applicants: formattedApplicants,
        result: result,
        filteredApplicants: filteredApplicants,
      });
    }
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// exports.getScoredCandidates = async (req, res) => {
//   //get authCode from params
//   //example url params
//   const CandidateEmail = req.body.candidate;
//   console.log("CandidateEmail:", CandidateEmail);
//   // const authCode = "z1GV8zlVRfUOu1q1EM31HjisnlLRphegdL-Q3fQ-FuA"
//   let eventUri;
//   const eventTypeName = "30 Minute Meeting"; // Name of the event type to check/create
//   if (recruiterAccessToken) {
//     ensureEventType(recruiterAccessToken, eventTypeName)
//       .then((eventTypeUri) => {
//         eventUri = eventTypeUri;
//         console.log("Final Event Type URI:", eventTypeUri);
//         const ConfirmMessage = bulkScheduleMeetings(
//           recruiterAccessToken,
//           eventUri,
//           CandidateEmail
//         );
//         console.log("recruiterAccessToken:", recruiterAccessToken);
//         res.json(ConfirmMessage);
//       })
//       .catch((error) => {
         
//         console.error("Failed to ensure event type:", error);
//       });
//   }
// };

const oauth2Client = new OAuth2(
  '665488303177-057lra11leog8gnbati275ej7p6afdf4.apps.googleusercontent.com',     // Your OAuth 2.0 client ID
  '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', // Your OAuth 2.0 client secret
  'https://localhost:5173/oauth/callback'   // Redirect URI specified in the Google Cloud Console
);


exports.authGoogle = async (req, res) => {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  res.json(authorizeUrl);
}
exports.authGoogleCode = async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.json(tokens);
}
exports.scheduleMeeting = async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.json(tokens);
}
  