const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  order_id: DataTypes.STRING,
  payment_id: DataTypes.STRING,
  status: DataTypes.STRING
});

module.exports = Order;
