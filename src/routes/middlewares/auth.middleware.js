// src/routes/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

module.exports = function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied: No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
s