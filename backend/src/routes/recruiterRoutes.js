const express = require('express');
const { createJob, getApplicants, getJobs } = require('../controllers/recruiterController');
const router = express.Router();

router.post('/job', createJob);
router.get('/applicants', getApplicants);
router.get("/mycreatedjobs",getJobs);

module.exports = router;
