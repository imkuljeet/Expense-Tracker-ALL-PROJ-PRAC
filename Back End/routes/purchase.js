const express  = require('express');
const router   = express.Router();
const authenticate = require('../middlewares/authenticate');

const purchaseController = require('../controllers/purchase');

// 3.1 Create a Razorpay order
router.post('/premium', authenticate, purchaseController.buyPremium);

// 3.2 Update payment status & grant premium
router.post('/update-status', authenticate, purchaseController.updatePaymentStatus);

module.exports = router;
