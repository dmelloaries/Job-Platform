const prisma = require('../utils/prismaClient');
const { ParseResumeDistributed } = require('../ai/distributor.js');

// Get jobs with optional filtering by location and title
exports.getJobs = async (req, res) => {
  const { location, title } = req.query;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        location: { contains: location || "" },
        title: { contains: title || "" },
      },
      select: {
        id: true,
        companyname: true,  // Include the company name
        title: true,
        description: true,
        location: true,
        salary: true,  // Include the salary
        recruiter: {
          select: {
            name: true,  // Include recruiter name (if needed)
          },
        },
      },
    });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get jobs with optional filtering by location, salary, and title
exports.filterJobs = async (req, res) => {
  const { location, salary, title } = req.body;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        location: { contains: location || "" },
        salary: salary ? { gte: Number(salary) } : undefined, // Filter for jobs with salary greater than or equal to the requested salary
        title: { contains: title || "" },
      },
      select: {
        id: true,
        companyname: true,
        title: true,
        description: true,
        location: true,
        salary: true,
        recruiter: {
          select: {
            name: true,  // Include recruiter name
          },
        },
      },
    });

    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Apply for a job
exports.applyForJob = async (req, res) => {
  const { jobId } = req.body;

  try {
    const applicantId = req.user.id;  // Extract applicant ID from JWT token

    // Check if the applicant exists in the database
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return res.status(404).json({ message: "Applicant not found." });
    }

    // Check if the job exists in the database
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Check if the applicant has already applied for the job
    const existingApplication = await prisma.application.findUnique({
      where: {
        applicantId_jobId: {  // Ensure this composite unique index exists in your Prisma schema
          applicantId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job." });
    }

    // Create new application
    const application = await prisma.application.create({
      data: {
        applicantId,
        jobId,
        status: 'Applied',
      },
    });

    res.json(application);
  } catch (error) {
    console.error("Error applying for job:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Update applicant profile information
exports.updateApplicantProfile = async (req, res) => {
  const applicantId = req.user.id;  // Get applicant's ID from the JWT token
  const { bio, skills, resume, resumeOriginalName, profilePhoto } = req.body;

  try {
    const updatedApplicant = await prisma.applicant.update({
      where: {
        id: applicantId,
      },
      data: {
        bio: bio || undefined,  // Update bio if provided
        skills: skills || undefined,  // Update skills array if provided
        resume: resume || undefined,  // Update resume URL if provided
        resumeOriginalName: resumeOriginalName || undefined,  // Update original resume filename if provided
        profilePhoto: profilePhoto || undefined,  // Update profile photo URL if provided
      },
    });

    res.json(updatedApplicant);
  } catch (error) {
    console.error("Error updating profile:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get list of companies applied to by the applicant
exports.getCompaniesApplied = async (req, res) => {
  const applicantId = req.user.id;  // Get applicant's ID from the JWT token

  try {
    const applications = await prisma.application.findMany({
      where: {
        applicantId: applicantId,  // Get all applications by this applicant
      },
      include: {
        job: {
          include: {
            recruiter: true,  // Include the recruiter (company) information
          },
        },
      },
    });

    // Map over applications to return relevant company information, including company name from the `job`
    const companiesApplied = applications.map(application => ({
      companyName: application.job.companyname,  // Fetch company name from Job model
      jobTitle: application.job.title,
      salary: application.job.salary,  // Include the salary information
      status: application.status,
    }));

    res.json(companiesApplied);
  } catch (error) {
    console.error("Error fetching companies applied to:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get applicant profile information
exports.getApplicantProfile = async (req, res) => {
  const applicantId = req.user.id;  

  try {
    const applicantProfile = await prisma.applicant.findUnique({
      where: {
        id: applicantId,
      },
      select: {
        name: true,
        email: true,
        bio: true,
        skills: true,
        resume: true,
        resumeOriginalName: true,
        profilePhoto: true,
      },
    });

    if (!applicantProfile) {
      return res.status(404).json({ message: 'Applicant profile not found' });
    }

    res.json(applicantProfile);
  } catch (error) {
    console.error("Error fetching applicant profile:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Parse resume for the applicant
exports.parseResume = async (req, res) => {
  try {
    const applicantId = req.user.id;  
    
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
      select: { resume: true }
    });

    if (!applicant || !applicant.resume) {
      return res.status(404).json({ error: 'Applicant or resume not found' });
    }

    const result = await ParseResumeDistributed(applicant.resume);
    console.log('Parsed resume:', result);
    res.json(result);
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'Failed to parse resume' });
  }
};
