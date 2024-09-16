const express = require('express');
const { getJobs, applyForJob, updateApplicantProfile, getCompaniesApplied, getApplicantProfile } = require('../controllers/applicantController');
const router = express.Router();

router.get('/jobs', getJobs);
router.post('/apply', applyForJob);
router.post('/update', updateApplicantProfile);
router.get('/applied',getCompaniesApplied );
router.get('/getProfileinfo',getApplicantProfile);

module.exports = router;
