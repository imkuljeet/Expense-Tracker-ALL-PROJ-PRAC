const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
}

module.exports = authenticate;
