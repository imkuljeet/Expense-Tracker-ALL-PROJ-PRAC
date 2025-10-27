const express = require('express');

const expenseController = require('../controllers/expense');

const router = express.Router();

router.post('/add-expense',expenseController.addExpense);
router.get('/get-expenses',expenseController.getAllExpemses);


module.exports = router;