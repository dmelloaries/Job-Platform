const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");
const ScoreCandidatesDistributed = require("../ai/filtering/FilterDistributor.js");
const nodemailer = require("nodemailer");
require("dotenv").config();


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
  const { jobId } = req.params; // Change here

  // Validate jobId
  if (!jobId) {
    return res.status(400).json({ message: "Job ID is required." });
  }

  try {
    const applicants = await prisma.application.findMany({
      where: { jobId: parseInt(jobId, 10) }, // Ensure jobId is a number
      include: {
        job: { select: { title: true, description: true } },
        applicant: true,
      },
    });

    if (applicants.length === 0) {
      return res
        .status(404)
        .json({ message: "No applicants found for this job." });
    }

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

    res.json({
      job: jobInfo,
      applicants: formattedApplicants,
    });
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
    console.log("1")
    const applicants = await prisma.application.findMany({
      where: { jobId: parseInt(jobId, 10) }, // Ensure jobId is a number
      include: {
        job: { select: { title: true, description: true } }, // Include job title and description
        applicant: true, // Include associated applicant data
      },
    });
    console.log("1111111111");
    if (applicants.length === 0) {
      return res.status(404).json({ message: "No applicants found for this job." });
    }
    console.log("1111111111");
    // Structured the response
    const jobInfo = {
      title: applicants[0].job.title,
      description: applicants[0].job.description,
    };
    console.log("1111111111");
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
    console.log("1111111111");
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
    console.log("1111111111");
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




//Your messageApplicant function
exports.messageApplicant = async (req, res) => {
  console.log("Email User:", process.env.EMAIL_USER);
  console.log("Email Pass:", process.env.EMAIL_PASS);

  const { email, messageContent } = req.body;

  if (!email || !messageContent) {
    return res
      .status(400)
      .json({ message: "Email and message content are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Use 'gmail' for Gmail service
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail password or App Password
      },
      logger: true, // Log to console
      debug: true, // Show SMTP traffic
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Job Application Update",
      text: messageContent,
    };

    const info = await transporter.sendMail(mailOptions);

    if (info.accepted.length > 0) {
      res
        .status(200)
        .json({ message: "Message sent successfully to the applicant." });
    } else {
      res.status(500).json({ message: "Failed to send the message." });
    }
  } catch (error) {
    console.error("Error messaging applicant:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
