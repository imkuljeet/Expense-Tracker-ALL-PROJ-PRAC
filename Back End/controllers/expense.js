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
      UserId : req.user.id
    //   UserId: req.user.id  // assuming user is authenticated and attached to request
    });

    res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Something went wrong while adding the expense' });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { UserId: req.user.id }
    });
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

const deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id; // 🧠 Comes from token middleware

  console.log("DELETE >>>>", expenseId);

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required in the URL.' });
  }

  try {
    // ✅ Only delete if expense belongs to this user
    const deletedCount = await Expense.destroy({
      where: {
        id: expenseId,
        UserId: userId // 👀 Match user to ensure ownership
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error in deleteExpense controller:', error);
    return res.status(500).json({ message: 'Internal server error while deleting expense' });
  }
};

const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { amount, description, category } = req.body;
  const userId = req.user.id; // From authentication middleware

  console.log("UPDATE >>>>", expenseId);

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required in the URL.' });
  }

  try {
    // ✅ Fetch only if it belongs to the logged-in user
    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        UserId: userId
      }
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    // ✅ Update fields
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



module.exports = { addExpense, getAllExpenses, deleteExpense, updateExpense };
