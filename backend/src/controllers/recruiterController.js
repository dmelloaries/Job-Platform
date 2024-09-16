const prisma = require('../utils/prismaClient');
const jwt = require('jsonwebtoken');

// Create a job, with recruiterId fetched from the authenticated user
exports.createJob = async (req, res) => {
  const { title, description, location } = req.body;

  try {
    
    const recruiterId = req.user.id;  // Use recruiter ID from JWT token
   

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

// Get applicants for a specific job
exports.getApplicants = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applicants = await prisma.application.findMany({
      where: { jobId: parseInt(jobId) }, 
      include: { applicant: true },  // Include associated applicant data
    });

    res.json(applicants);
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};
