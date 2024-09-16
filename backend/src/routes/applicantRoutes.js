const express = require('express');
const { getJobs, applyForJob, updateApplicantProfile, getCompaniesApplied } = require('../controllers/applicantController');
const router = express.Router();

router.get('/jobs', getJobs);
router.post('/apply', applyForJob);
router.post('/update', updateApplicantProfile);
router.get('/applied',getCompaniesApplied );

module.exports = router;
