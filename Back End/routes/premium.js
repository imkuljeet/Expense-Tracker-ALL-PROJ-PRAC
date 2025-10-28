const express  = require('express');
const router   = express.Router();
const authenticate = require('../middlewares/authenticate');

const premiumController = require('../controllers/premium');

// 3.1 Create a Razorpay order
router.get('/showLeaderboard', authenticate, premiumController.getUserLeaderboard);

module.exports = router;
