const express = require('express');
const { createJob, getApplicants, getJobs,getFilteredApplicants,getScoredCandidates } = require('../controllers/recruiterController');
const router = express.Router();

router.post('/job', createJob);
router.get('/applicants', getApplicants);
router.get("/mycreatedjobs",getJobs);
router.get("/filteredapplicants",getFilteredApplicants);
router.get("/scorecandidates",getScoredCandidates); 

module.exports = router;
