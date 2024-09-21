const express = require('express');
const { createJob, getApplicants, getJobs, updateApplicantStatus } = require('../controllers/recruiterController');
const router = express.Router();

router.post('/job', createJob);
router.get('/applicants/:jobId', getApplicants);
router.get("/mycreatedjobs",getJobs);
//router.get("/shortlist",updateApplicantStatus);

module.exports = router;
