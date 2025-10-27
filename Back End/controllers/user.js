const User = require('../models/User');

const signup = async (req, res) => {
    const { name, email, password } = req.body;

      // 1) Simple presence check
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are all required.' });
    }
    
    try {
      const newUser = await User.create({ name, email, password });
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
}

module.exports = { signup };