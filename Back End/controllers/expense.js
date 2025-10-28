const Expense = require('../models/Expense');
const User = require('../models/User');

const sequelize  = require('../util/database'); // adjust path if needed

const addExpense = async (req, res, next) => {
  const t = await sequelize.transaction(); // start transaction

  try {
    const { amount, description, category } = req.body;

    if (!amount || !description || !category) {
      return res
        .status(400)
        .json({ message: 'Amount, description and category are all required.' });
    }

    // 1. Create the expense within the transaction
    const newExpense = await Expense.create({
      amount,
      description,
      category,
      UserId: req.user.id
    }, { transaction: t });

    // 2. Update user's totalExpenses within the transaction
    const user = await User.findByPk(req.user.id, { transaction: t });
    user.totalExpenses += parseInt(amount);
    await user.save({ transaction: t });

    // 3. Commit the transaction
    await t.commit();

    res.status(201).json({
      message: 'Expense added successfully',
      expense: newExpense
    });

  } catch (error) {
    await t.rollback(); // rollback on error
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
  const userId = req.user.id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required in the URL.' });
  }

  const t = await sequelize.transaction(); // start transaction

  try {
    // 1. Find the expense first to get its amount
    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        UserId: userId
      },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    const amountToSubtract = expense.amount;

    // 2. Delete the expense
    await expense.destroy({ transaction: t });

    // 3. Update user's totalExpenses
    const user = await User.findByPk(userId, { transaction: t });
    user.totalExpenses -= amountToSubtract;
    if (user.totalExpenses < 0) user.totalExpenses = 0;
    await user.save({ transaction: t });

    // 4. Commit transaction
    await t.commit();

    return res.status(200).json({ message: 'Expense deleted successfully' });

  } catch (error) {
    await t.rollback(); // rollback on error
    console.error('Error in deleteExpense controller:', error);
    return res.status(500).json({ message: 'Internal server error while deleting expense' });
  }
};

const updateExpense = async (req, res) => {
  const expenseId = req.params.id;
  const { amount, description, category } = req.body;
  const userId = req.user.id;

  if (!expenseId) {
    return res.status(400).json({ message: 'Expense ID is required in the URL.' });
  }

  const t = await sequelize.transaction(); // start transaction

  try {
    // 1. Find the expense
    const expense = await Expense.findOne({
      where: {
        id: expenseId,
        UserId: userId
      },
      transaction: t
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }

    const oldAmount = expense.amount;
    const newAmount = parseInt(amount);
    const amountDifference = newAmount - oldAmount;

    // 2. Update expense fields
    expense.amount = newAmount;
    expense.description = description;
    expense.category = category;
    await expense.save({ transaction: t });

    // 3. Update user's totalExpenses
    const user = await User.findByPk(userId, { transaction: t });
    user.totalExpenses += amountDifference;
    if (user.totalExpenses < 0) user.totalExpenses = 0;
    await user.save({ transaction: t });

    // 4. Commit transaction
    await t.commit();

    return res.status(200).json({ message: 'Expense updated successfully', expense });

  } catch (error) {
    await t.rollback();
    console.error('Error in updateExpense controller:', error);
    return res.status(500).json({
      message: 'Internal server error while updating expense'
    });
  }
};

module.exports = { addExpense, getAllExpenses, deleteExpense, updateExpense };
