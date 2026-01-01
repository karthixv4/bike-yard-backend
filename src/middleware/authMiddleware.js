// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    next();
  });
};

module.exports = verifyJWT;