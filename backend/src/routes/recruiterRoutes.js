const express = require('express');
const { createJob, getApplicants } = require('../controllers/recruiterController');
const router = express.Router();

router.post('/job', createJob);
router.get('/applicants/:jobId', getApplicants);

module.exports = router;
