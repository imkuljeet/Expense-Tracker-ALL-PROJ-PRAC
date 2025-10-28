const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Make sure this is installed

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // 1) Simple presence check
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Name, email and password are all required.' });
  }

  try {
    // 2) Prevent duplicate registrations
    const existing = await User.findOne({ where : { email } });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'Email is already registered.' });
    }

    // 3) Hash the password
    const saltRounds      = 12;                // adjust for performance vs security
    const hashedPassword  = await bcrypt.hash(password, saltRounds);

    // 4) Create the user with the hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // 5) Respond (never send the raw password back!)
    res
      .status(201)
      .json({
        message: 'User created successfully',
        user: {
          name:  newUser.name,
          email: newUser.email
        }
      });
  } catch (error) {
    console.error('Error creating user:', error);
    res
      .status(500)
      .json({ message: 'Failed to create user', error: error.message });
  }
};

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // ✅ Create token
    const token = jwt.sign(
      { id: user.id, email: user.email,isPremiumUser: user.isPremiumUser }, // payload
      process.env.JWT_SECRET,            // secret key
      { expiresIn: '1h' }                // options
    );

    // ✅ Send back token and optionally user info
    return res.status(200).json({
      message: 'Logged in successfully',
      token
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

const crypto = require('crypto');
const nodemailer = require('nodemailer');
// const bcrypt = require('bcrypt');
// const User = require('../models/User');
const ForgotPassword = require('../models/ForgotPassword');

// Setup Brevo transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    await ForgotPassword.create({
      token,
      UserId: user.id,
      expiresAt
    });

    const resetLink = `${process.env.WEBSITE}/reset-password/${token}`;


    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 15 minutes.</p>`
    });

    res.status(200).json({ message: 'Reset link sent if email is registered.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const record = await ForgotPassword.findOne({ where: { token, isActive: true } });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(record.UserId);
    if (!user) return res.status(400).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    record.isActive = false;
    await record.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};



module.exports = { signup, login ,forgotPassword, resetPassword};
