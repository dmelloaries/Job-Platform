const express = require('express');
const { getJobs, applyForJob, updateApplicantProfile, getCompaniesApplied, getApplicantProfile, parseResume, filterJobs } = require('../controllers/applicantController');
const router = express.Router();

router.get('/jobs', getJobs);// \
router.get('/filter',filterJobs);
router.get('/jobs', getJobs);// 
router.post('/apply', applyForJob);//
router.post('/update', updateApplicantProfile); /////
router.get('/applied',getCompaniesApplied );
router.get('/profileinfo',getApplicantProfile); /////
router.get('/resumeReview', parseResume); 

module.exports = router;
