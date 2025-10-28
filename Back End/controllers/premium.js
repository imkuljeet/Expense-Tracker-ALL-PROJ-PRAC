const { fn, col } = require('sequelize');
const User = require('../models/User');
const Expense = require('../models/Expense');

const getUserLeaderboard = async (req, res) => {
  try {
    // 1. Get total expenses per user using GROUP BY
    const expenseTotals = await Expense.findAll({
      attributes: ['UserId', [fn('SUM', col('amount')), 'totalExpense']],
      group: ['UserId'],
      raw: true
    });

    // 2. Convert to lookup object: { UserId: totalExpense }
    const expenseMap = {};
    expenseTotals.forEach((entry) => {
      expenseMap[entry.UserId] = parseFloat(entry.totalExpense);
    });

    // 3. Get all users
    const users = await User.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    // 4. Build leaderboard
    const leaderboard = users.map((user) => ({
      name: user.name,
      totalExpense: expenseMap[user.id] || 0
    }));

    // 5. Sort by totalExpense descending
    leaderboard.sort((a, b) => b.totalExpense - a.totalExpense);

    res.status(200).json({ leaderboard });

  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ message: 'Could not fetch leaderboard' });
  }
};


module.exports = { getUserLeaderboard };