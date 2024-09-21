const express = require('express');
const { createJob, getApplicants, getJobs,getFilteredApplicants,messageApplicant} = require('../controllers/recruiterController');
const router = express.Router();

router.post('/job', createJob);
router.get("/applicants/:jobId", getApplicants);
router.get("/mycreatedjobs",getJobs);
router.get("/filteredapplicants",getFilteredApplicants);
router.post("/messageApplicant", messageApplicant);

module.exports = router;
