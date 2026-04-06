const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driverName: {
    type: String,
    required: true
  },
  stopNumber: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stop', stopSchema);