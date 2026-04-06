const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['topup', 'fare', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  beforeBalance: {
    type: Number,
    required: true
  },
  afterBalance: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  paymentMethod: {
    type: String,
    enum: ['khalti', 'card', 'cash', 'wallet', 'rfid'],
    default: 'wallet'
  },
  paymentId: {
    type: String // Khalti pidx or transaction ID
  },
  description: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);