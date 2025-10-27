const express = require('express');

const expenseController = require('../controllers/expense');

const router = express.Router();

router.post('/add-expense',expenseController.addExpense);
// router.post('/login',userController.login);


module.exports = router;