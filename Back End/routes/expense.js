const express = require('express');

const expenseController = require('../controllers/expense');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

router.post('/add-expense',authenticate,expenseController.addExpense);
router.get('/get-expenses',authenticate,expenseController.getAllExpenses);
router.delete('/delete-expense/:id',authenticate,expenseController.deleteExpense);
router.put('/update-expense/:id', authenticate,expenseController.updateExpense);



module.exports = router;