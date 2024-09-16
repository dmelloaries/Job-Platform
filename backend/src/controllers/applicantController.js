const prisma = require('../utils/prismaClient');

// Get jobs with optional filtering by location and title
exports.getJobs = async (req, res) => {
  const { location, title } = req.query;

  try {
    const jobs = await prisma.job.findMany({
      where: {
        location: { contains: location || "" },
        title: { contains: title || "" },
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

    // Map over applications to return only the relevant company information
    const companiesApplied = applications.map(application => ({
      companyName: application.job.recruiter.name,
      jobTitle: application.job.title,
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
  const applicantId = req.user.id;  // Get applicant's ID from the JWT token

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
