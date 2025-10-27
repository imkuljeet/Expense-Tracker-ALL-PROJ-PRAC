const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//--------------------------------------------------------------------------------------------------------

const sequelize = require('./util/database')

//--------------------------------------------------------------------------------------------------------


const User = require('./models/User');

//--------------------------------------------------------------------------------------------------------

const app = express();

//--------------------------------------------------------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());

//--------------------------------------------------------------------------------------------------------


app.post('/user/signup', async (req, res) => {
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
  });

//--------------------------------------------------------------------------------------------------------

const PORT = process.env.PORT || 3000;

sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to sync database:', err);
  });
