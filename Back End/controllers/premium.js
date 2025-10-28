const { fn, col } = require('sequelize');
const User = require('../models/User');
const Expense = require('../models/Expense');

const getUserLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: ['name', 'totalExpenses'],
      order: [['totalExpenses', 'DESC']],
      raw: true
    });

    res.status(200).json({ leaderboard });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Could not fetch leaderboard' });
  }
};

module.exports = { getUserLeaderboard };