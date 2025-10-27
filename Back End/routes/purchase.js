const express  = require('express');
const Razorpay = require('razorpay');
const router   = express.Router();
const Order    = require('../models/Order');
const User     = require('../models/User');
const authenticate = require('../middlewares/authenticate');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 3.1 Create a Razorpay order
router.post('/premium', authenticate, async (req, res) => {
  try {
    const amount = 2500; // ₹25.00 in paise
    const order  = await razorpay.orders.create({
      amount,
      currency: 'INR'
    });

    console.log("REQ USER>>",req.user);

    await req.user.createOrder({
      order_id: order.id,
      status: 'PENDING'
    });

    res.status(201).json({
      order_id: order.id,
      amount:    order.amount,
      key_id:    process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create order' });
  }
});

// 3.2 Update payment status & grant premium
router.post('/update-status', authenticate, async (req, res) => {
  const { order_id, payment_id } = req.body;
  try {
    const order = await Order.findOne({ where: { order_id } });
    order.payment_id = payment_id;
    order.status     = 'SUCCESSFUL';
    await order.save();

    // Mark user as premium
    req.user.isPremiumUser = true;
    await req.user.save();

    res.json({ success: true, message: 'Premium enabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not update order status' });
  }
});

module.exports = router;
