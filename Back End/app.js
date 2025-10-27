const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

//--------------------------------------------------------------------------------------------------------

const sequelize = require('./util/database')

//--------------------------------------------------------------------------------------------------------


const User = require('./models/User');

//--------------------------------------------------------------------------------------------------------

const userRoutes = require('./routes/user');

//--------------------------------------------------------------------------------------------------------

const app = express();

//--------------------------------------------------------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());

//--------------------------------------------------------------------------------------------------------


app.use('/user',userRoutes);

//--------------------------------------------------------------------------------------------------------

const PORT = process.env.PORT;

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
