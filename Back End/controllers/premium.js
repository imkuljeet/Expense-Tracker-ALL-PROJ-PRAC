const User = require('../models/User');
const Expense = require('../models/Expense');

const getUserLeaderboard = async (req, res) => {
    try {
      const users = await User.findAll();
      const expenses = await Expense.findAll();
  
      const addedExpenses = {};
  
      // Sum expenses per user
      expenses.forEach((expense) => {
        if (addedExpenses[expense.UserId]) {
          addedExpenses[expense.UserId] += expense.amount;
        } else {
          addedExpenses[expense.UserId] = expense.amount;
        }
      });
  
      // Build leaderboard array
      const leaderboard = users.map((user) => {
        return {
          name: user.name,
          totalExpense: addedExpenses[user.id] || 0
        };
      });
  
      // Sort by totalExpense descending
      leaderboard.sort((a, b) => b.totalExpense - a.totalExpense);
  
      res.status(200).json({ leaderboard });
  
    } catch (err) {
      console.error('Leaderboard error:', err);
      res.status(500).json({ message: 'Could not fetch leaderboard' });
    }
  };
  

module.exports = { getUserLeaderboard };