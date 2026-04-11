const User = require('../models/User.cjs');
const Stop = require('../models/Stop.cjs');
const Transaction = require('../models/Transaction.cjs');
const { sendSMS } = require('../services/smsService.cjs');

const isAdmin = (userRole) => {
  return userRole === 'admin';
};

exports.getStats = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    const totalPassengers = await User.countDocuments({ role: 'passenger' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });

    // Sum all completed fare transactions from Transaction collection
    const fareTransactions = await Transaction.find({ type: 'fare', status: 'completed' });
    const totalCollection = fareTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    const lowBalanceAlerts = await User.countDocuments({
      role: 'passenger',
      wallet_balance: { $lt: 20 }
    });

    res.json({ success: true, totalPassengers, totalDrivers, totalCollection, lowBalanceAlerts });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // Get all transactions from Transaction collection with passenger info
    const transactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .populate('userId', 'name email');

    const formatted = transactions.map(t => ({
      id: t._id,
      passenger: t.userId?.name || 'Unknown',
      email: t.userId?.email || '',
      type: t.type,
      amount: t.amount,
      status: t.status,
      timestamp: t.timestamp,
      description: t.description
    }));

    res.json({ success: true, transactions: formatted });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

exports.getLowBalanceUsers = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    const lowBalanceUsers = await User.find({
      role: 'passenger',
      wallet_balance: { $lt: 20 }
    }).select('name email phone wallet_balance rfid_card_id');

    const formattedUsers = await Promise.all(lowBalanceUsers.map(async (user) => {
      const lastTxn = await Transaction.findOne({ userId: user._id })
        .sort({ timestamp: -1 });
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rfid: user.rfid_card_id || 'Not linked',
        balance: user.wallet_balance || 0,
        lastUsed: lastTxn ? new Date(lastTxn.timestamp).toLocaleString() : 'Never'
      };
    }));

    res.json({ success: true, users: formattedUsers });
  } catch (error) {
    console.error('Get low balance users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch low balance users' });
  }
};

exports.sendAlert = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    const { userId, message } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const smsMessage = message || `Dear ${user.name}, your balance is Rs. ${user.wallet_balance}. Please recharge.`;
    const result = await sendSMS(user.phone, smsMessage);
    if (result.success) {
      res.json({ success: true, message: `SMS alert sent to ${user.name} (${user.phone})` });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send SMS', error: result.error });
    }
  } catch (error) {
    console.error('Send alert error:', error);
    res.status(500).json({ success: false, message: 'Failed to send alert', error: error.message });
  }
};

exports.linkRFID = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
    const { rfid_card_id, userId } = req.body;
    if (!rfid_card_id || !userId) {
      return res.status(400).json({ success: false, message: 'rfid_card_id and userId are required' });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { rfid_card_id: rfid_card_id },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `RFID card linked to ${user.name}`, rfid_card_id: user.rfid_card_id });
  } catch (error) {
    console.error('Link RFID Error:', error);
    res.status(500).json({ success: false, message: 'Failed to link RFID card', error: error.message });
  }
};

exports.getAllPassengers = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const passengers = await User.find({ role: 'passenger' })
      .select('name email phone wallet_balance rfid_card_id');
    res.json({ success: true, passengers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch passengers' });
  }
};