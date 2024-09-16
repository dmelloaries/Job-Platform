const prisma = require('../utils/prismaClient');

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

exports.applyForJob = async (req, res) => {
  const { applicantId, jobId } = req.body;

  try {
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
