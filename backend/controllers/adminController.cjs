const User = require('../models/User.cjs');
const Stop = require('../models/Stop.cjs');
// Remove smsService if not configured
// const smsService = require('../services/smsService.cjs');

// Check if user is admin
const isAdmin = (userRole) => {
  return userRole === 'admin';
};

// Get admin statistics
exports.getStats = async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    // Count total passengers
    const totalPassengers = await User.countDocuments({ role: 'passenger' });
    
    // Count total drivers
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    
    // Get all passengers to calculate total collection
    const passengers = await User.find({ role: 'passenger' });
    const totalCollection = passengers.reduce((sum, p) => sum + (p.wallet_balance || 0), 0);
    
    // Count low balance users (balance < 10000 paisa = Rs 100)
    const lowBalanceAlerts = await User.countDocuments({ 
      role: 'passenger',
      wallet_balance: { $lt: 10000 }
    });

    res.json({
      success: true,
      totalPassengers,
      totalDrivers,
      totalCollection,
      lowBalanceAlerts
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats' 
    });
  }
};

// Get recent transactions
exports.getTransactions = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    // Get all passengers with their transactions
    const passengers = await User.find({ role: 'passenger' })
      .select('name email walletTransactions')
      .limit(50);

    // Flatten all transactions
    const allTransactions = [];
    passengers.forEach(passenger => {
      if (passenger.walletTransactions && passenger.walletTransactions.length > 0) {
        passenger.walletTransactions.forEach(txn => {
          allTransactions.push({
            id: txn._id,
            passenger: passenger.name,
            email: passenger.email,
            type: txn.type,
            amount: txn.amount,
            status: txn.status,
            timestamp: txn.timestamp,
            description: txn.description
          });
        });
      }
    });

    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      transactions: allTransactions.slice(0, 50) // Return latest 50
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch transactions' 
    });
  }
};

// Get low balance users
exports.getLowBalanceUsers = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    // Find passengers with balance < 10000 paisa (Rs 100)
    const lowBalanceUsers = await User.find({ 
      role: 'passenger',
      wallet_balance: { $lt: 10000 }
    }).select('name email phone wallet_balance rfid_card_id walletTransactions');

    const formattedUsers = lowBalanceUsers.map(user => {
      // Get last transaction time
      let lastUsed = 'Never';
      if (user.walletTransactions && user.walletTransactions.length > 0) {
        const lastTxn = user.walletTransactions[user.walletTransactions.length - 1];
        lastUsed = new Date(lastTxn.timestamp).toLocaleString();
      }

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rfid: user.rfid_card_id || 'Not linked',
        balance: user.wallet_balance || 0,
        lastUsed
      };
    });

    res.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Get low balance users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch low balance users' 
    });
  }
};

// Send alert to user
exports.sendAlert = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the alert (you can implement email/SMS later)
    console.log(`🔔 Alert sent to user: ${user.name} (${user.email})`);
    console.log(`   Balance: Rs ${(user.wallet_balance / 100).toFixed(2)}`);
    console.log(`   Phone: ${user.phone || 'Not available'}`);

    // TODO: Implement actual notification system
    // Options:
    // 1. Email using nodemailer
    // 2. SMS using Twilio
    // 3. Push notification
    // 4. In-app notification

    res.json({
      success: true,
      message: `Alert logged for ${user.name}. Balance: Rs ${(user.wallet_balance / 100).toFixed(2)}`
    });

  } catch (error) {
    console.error('❌ Send alert error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send alert',
      error: error.message
    });
  }
};