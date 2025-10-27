const Expense = require('../models/Expense');

const addExpense = async (req, res, next) => {
  try {
    const { amount, description, category } = req.body;

    // 1. Presence check
  if (!amount || !description || !category) {
    return res
      .status(400)
      .json({ message: 'Amount, description and category are all required.' });
  }

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

const getAllExpemses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();  
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  console.log("DELETE>>>>",expenseId);

  if (!expenseId) {
    return res
      .status(400)
      .json({ message: 'Expense ID is required in the URL.' });
  }

  try {
    // Check if the expense exists
    const deletedCount = await Expense.destroy({ where: { id: expenseId } });

    if (deletedCount === 0) {
      // No rows affected means no matching record
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Success: send back confirmation
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error in deleteExpense controller:', error);
    return res.status(500).json({
      message: 'Internal server error while deleting expense'
    });
  }
};

const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { amount, description, category } = req.body;
  console.log("UPDATE>>>>", expenseId);

  if (!expenseId) {
    return res
      .status(400)
      .json({ message: 'Expense ID is required in the URL.' });
  }

  try {
    // Find the expense
    const expense = await Expense.findByPk(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Update fields
    expense.amount = amount;
    expense.description = description;
    expense.category = category;

    await expense.save();

    return res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Error in updateExpense controller:', error);
    return res.status(500).json({
      message: 'Internal server error while updating expense'
    });
  }
};


module.exports = { addExpense, getAllExpemses, deleteExpense, updateExpense };
