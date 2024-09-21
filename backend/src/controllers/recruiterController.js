const prisma = require("../utils/prismaClient");
const jwt = require("jsonwebtoken");


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

// // Get applicants for a specific job
// exports.getApplicants = async (req, res) => {
//   const { jobId } = req.body;

//   // Validate jobId
//   if (!jobId) {
//     return res.status(400).json({ message: "Job ID is required." });
//   }

//   try {
//     const applicants = await prisma.application.findMany({
//       where: { jobId: parseInt(jobId, 10) }, // Ensure jobId is a number
//       include: {
//         job: { select: { title: true, description: true } }, // Include job title and description
//         applicant: true, // Include associated applicant data
//       },
//     });

//     if (applicants.length === 0) {
//       return res.status(404).json({ message: "No applicants found for this job." });
//     }

//     // Structured the response
//     const jobInfo = {
//       title: applicants[0].job.title,
//       description: applicants[0].job.description,
//     };

//     const formattedApplicants = applicants.map(applicant => ({
//       id: applicant.applicant.id,
//       name: applicant.applicant.name,
//       email: applicant.applicant.email,
//       resume: applicant.applicant.resume,
//       resumeOriginalName: applicant.applicant.resumeOriginalName,
//       bio: applicant.applicant.bio,
//       skills: applicant.applicant.skills,
//       profilePhoto: applicant.applicant.profilePhoto,
//     }));

//     res.json({
//       job: jobInfo,
//       applicants: formattedApplicants,
//     });
//   } catch (error) {
//     console.error("Error retrieving applicants:", error.message || error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
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
      return res.status(404).json({ message: "No applicants found for this job." });
    }

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

    res.json({
      job: jobInfo,
      applicants: formattedApplicants,
    });
  } catch (error) {
    console.error("Error retrieving applicants:", error.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};



// // Update the applicant's status to "Shortlisted" or any other status
// exports.updateApplicantStatus = async (req, res) => {
//   const { applicantId, jobId, status } = req.body; // Destructure the applicantId, jobId, and status from req.body

//   // Validate input
//   if (!applicantId || !jobId || !status) {
//     return res.status(400).json({ message: "Applicant ID, Job ID, and status are required." });
//   }

//   try {
//     // Check if the application exists
//     const application = await prisma.application.findUnique({
//       where: {
//         applicantId_jobId: {
//           applicantId: parseInt(applicantId, 10),
//           jobId: parseInt(jobId, 10),
//         },
//       },
//     });

//     if (!application) {
//       return res.status(404).json({ message: "Application not found." });
//     }

//     // Update the status of the application
//     const updatedApplication = await prisma.application.update({
//       where: {
//         applicantId_jobId: {
//           applicantId: parseInt(applicantId, 10),
//           jobId: parseInt(jobId, 10),
//         },
//       },
//       data: { status }, // Update status to new value (e.g., "Shortlisted")
//     });

//     res.json({
//       message: "Application status updated successfully.",
//       updatedApplication,
//     });
//   } catch (error) {
//     console.error("Error updating applicant status:", error.message || error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
