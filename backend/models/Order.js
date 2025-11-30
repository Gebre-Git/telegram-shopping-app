
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  screenshot: {
    type: String, // Storing Base64 string
    required: true
  },
  telegramUserId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    default: 'Customer'
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
