const jwt = require('jsonwebtoken');
const prisma = require('../utils/prismaClient');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }

    // Attach the userId and role from the JWT payload to req.user
    req.user = { id: user.userId, role: user.role }; 
    next();
  });
};


exports.authorizeRecruiter = (req, res, next) => {
  if (req.user && req.user.role === 'Recruiter') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Recruiter only' });
  }
};

exports.authorizeApplicant = (req, res, next) => {
  if (req.user && req.user.role === 'Applicant') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Applicant only' });
  }
};
