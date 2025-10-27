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


module.exports = { addExpense, getAllExpemses, deleteExpense };
