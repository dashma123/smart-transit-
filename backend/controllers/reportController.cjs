const User = require('../models/User.cjs');
const Stop = require('../models/Stop.cjs');

// Check if user is admin
const isAdmin = (userRole) => {
  return userRole === 'admin';
};

// Get financial report (monthly/yearly)
exports.getFinancialReport = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { type } = req.query; // 'monthly' or 'yearly'

    let startDate;
    const now = new Date();

    if (type === 'monthly') {
      // Last 12 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    } else if (type === 'yearly') {
      // Last 5 years
      startDate = new Date(now.getFullYear() - 4, 0, 1);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid report type. Use "monthly" or "yearly"' 
      });
    }

    // Get all passengers with their transactions
    const passengers = await User.find({ role: 'passenger' });

    // Group transactions by month or year
    const reportData = [];
    
    if (type === 'monthly') {
      // Generate monthly data
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        let monthTotal = 0;
        passengers.forEach(passenger => {
          if (passenger.walletTransactions) {
            passenger.walletTransactions.forEach(txn => {
              const txnDate = new Date(txn.timestamp);
              if (txnDate.getMonth() === monthDate.getMonth() && 
                  txnDate.getFullYear() === monthDate.getFullYear()) {
                monthTotal += txn.amount;
              }
            });
          }
        });

        reportData.push({
          period: monthName,
          amount: monthTotal
        });
      }
    } else {
      // Generate yearly data
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        
        let yearTotal = 0;
        passengers.forEach(passenger => {
          if (passenger.walletTransactions) {
            passenger.walletTransactions.forEach(txn => {
              const txnDate = new Date(txn.timestamp);
              if (txnDate.getFullYear() === year) {
                yearTotal += txn.amount;
              }
            });
          }
        });

        reportData.push({
          period: year.toString(),
          amount: yearTotal
        });
      }
    }

    res.json({
      success: true,
      type,
      data: reportData
    });

  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate financial report' 
    });
  }
};

// Get collection report (daily)
exports.getCollectionReport = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const { days = 7 } = req.query; // Default last 7 days

    const passengers = await User.find({ role: 'passenger' });

    const reportData = [];
    const now = new Date();

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let dayTotal = 0;
      passengers.forEach(passenger => {
        if (passenger.walletTransactions) {
          passenger.walletTransactions.forEach(txn => {
            const txnDate = new Date(txn.timestamp);
            if (txnDate >= date && txnDate < nextDate) {
              dayTotal += txn.amount;
            }
          });
        }
      });

      reportData.push({
        date: date.toLocaleDateString(),
        amount: dayTotal
      });
    }

    res.json({
      success: true,
      days: parseInt(days),
      data: reportData
    });

  } catch (error) {
    console.error('Collection report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate collection report' 
    });
  }
};