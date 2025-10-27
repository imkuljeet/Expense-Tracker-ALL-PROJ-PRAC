const Expense = require('../models/Expense');

const addExpense = async (req, res, next) => {
  try {
    const { amount, description, category } = req.body;

    // Create the new expense
    const newExpense = await Expense.create({
      amount,
      description,
      category,
    //   UserId: req.user.id  // assuming user is authenticated and attached to request
    });

    res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Something went wrong while adding the expense' });
  }
};

module.exports = { addExpense };
