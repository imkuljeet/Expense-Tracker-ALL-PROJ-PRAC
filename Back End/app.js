const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');


dotenv.config();

//--------------------------------------------------------------------------------------------------------

const sequelize = require('./util/database')

//--------------------------------------------------------------------------------------------------------


const User = require('./models/User');
const Expense = require('./models/Expense');
const Order   = require('./models/Order');
const ForgotPassword = require('./models/ForgotPassword');

// ...


//--------------------------------------------------------------------------------------------------------

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
// ...


//--------------------------------------------------------------------------------------------------------

const app = express();

//--------------------------------------------------------------------------------------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


//--------------------------------------------------------------------------------------------------------


app.use('/user',userRoutes);
app.use('/expense',expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium',premiumRoutes);

// 👉 Add this route here
app.use('/reset-password/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});



//--------------------------------------------------------------------------------------------------------

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order, { foreignKey: 'UserId' });  
Order.belongsTo(User, { foreignKey: 'UserId' });

User.hasMany(ForgotPassword);
ForgotPassword.belongsTo(User);


const PORT = process.env.PORT;

// sequelize.sync({ alter: true })
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
