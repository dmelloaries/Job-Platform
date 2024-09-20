const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");
const ScoreCandidatesDistributed = require("../ai/filtering/FilterDistributor.js");
// Create a job, with recruiterId fetched from the authenticated user
exports.createJob = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    const recruiterId = req.user.id; // Use recruiter ID from JWT token

    const job = await prisma.job.create({
      data: {
        title,
        description,
        location,
        recruiterId, // Retrieved from JWT token
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
      return res.status(404).json({ message: "No applicants found for this job." });
    }

    // Structured the response
    const jobInfo = {
      title: applicants[0].job.title,
      description: applicants[0].job.description,
    };

    const formattedApplicants = applicants.map(applicant => ({
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
      formattedApplicants.map(async applicant => {
        const resume_url = applicant.resume;
        const job_requirement = jobInfo.description;
        const score = await ScoreCandidatesDistributed(resume_url, job_requirement);
        return score;
      })
    );
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getFilteredApplicants = async (req, res) => {
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
      return res.status(404).json({ message: "No applicants found for this job." });
    }

    // Structured the response
    const jobInfo = {
      title: applicants[0].job.title,
      description: applicants[0].job.description,
    };

    const formattedApplicants = applicants.map(applicant => ({
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
      formattedApplicants.map(async applicant => {
        const resume_url = applicant.resume;
        const job_requirement = jobInfo.description;
        const score = await ScoreCandidatesDistributed(resume_url, job_requirement);
        //inserting applicant id in the score object
        score.applicantId = applicant.id;
        return score;
      })
    );
    
    if (result) {
      res.json({
        job: jobInfo,
        applicants: formattedApplicants, // Send the job and applicants data
        result: result,
      });
    }
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
