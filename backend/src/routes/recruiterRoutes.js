const express = require('express');
const { createJob, getApplicants, getJobs,getFilteredApplicants } = require('../controllers/recruiterController');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const router = express.Router();

router.post('/job', createJob);
router.get('/applicants', getApplicants);
router.get("/mycreatedjobs",getJobs);
router.get("/filteredapplicants",getFilteredApplicants);
// router.get("/scorecandidates",getScoredCandidates);
// router.get("/auth/google", authGoogle);
// router.get("/oauth/callback", authGoogleCode);
// router.get("/schedule",scheduleMeeting);


module.exports = router;
