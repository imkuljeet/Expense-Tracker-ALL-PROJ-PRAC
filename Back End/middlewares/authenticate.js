// middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch the Sequelize instance (not raw data)
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error('User not found');

    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authenticate;
