const Razorpay = require('razorpay');
const Order    = require('../models/Order');
const User     = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const buyPremium =  async (req, res) => {
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
  }

  const jwt = require('jsonwebtoken');

  const updatePaymentStatus = async (req, res) => {
    const { order_id, payment_id } = req.body;
  
    try {
      // 1. Fetch the order record
      const order = await Order.findOne({ where: { order_id } });
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // 2. Update order and user in parallel
      await Promise.all([
        order.update({ payment_id, status: 'SUCCESSFUL' }),
        req.user.update({ isPremiumUser: true })
      ]);
  
      // 3. Create a new token with updated premium status
      const token = jwt.sign(
        {
          id: req.user.id,
          email: req.user.email,
          isPremiumUser: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // 4. Send response with token
      res.json({
        success: true,
        message: 'Premium enabled',
        token
      });
  
    } catch (err) {
      console.error('Update status error:', err);
      res.status(500).json({ message: 'Could not update order status' });
    }
  };
  

  module.exports = { buyPremium , updatePaymentStatus };