const Transaction = require('../models/Transaction.cjs');

const isAdmin = (userRole) => userRole === 'admin';

// Get financial report (monthly/yearly)
exports.getFinancialReport = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { type } = req.query;
    const now = new Date();
    const reportData = [];

    if (type === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
        const monthName = start.toLocaleString('default', { month: 'short', year: 'numeric' });

        const txns = await Transaction.find({
          type: 'fare',
          status: 'completed',
          timestamp: { $gte: start, $lt: end }
        });

        const amount = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
        reportData.push({ period: monthName, amount });
      }

    } else if (type === 'yearly') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getUTCFullYear() - i;
        const start = new Date(Date.UTC(year, 0, 1));
        const end = new Date(Date.UTC(year + 1, 0, 1));

        const txns = await Transaction.find({
          type: 'fare',
          status: 'completed',
          timestamp: { $gte: start, $lt: end }
        });

        const amount = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
        reportData.push({ period: year.toString(), amount });
      }

    } else {
      return res.status(400).json({ success: false, message: 'Invalid type. Use "monthly" or "yearly"' });
    }

    res.json({ success: true, type, data: reportData });

  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate financial report' });
  }
};

// Get collection report (daily)
exports.getCollectionReport = async (req, res) => {
  try {
    if (!isAdmin(req.userRole)) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const { days = 7 } = req.query;
    const now = new Date();
    const reportData = [];

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const start = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - i,
        0, 0, 0, 0
      ));
      const end = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - i + 1,
        0, 0, 0, 0
      ));

      const txns = await Transaction.find({
        type: 'fare',
        status: 'completed',
        timestamp: { $gte: start, $lt: end }
      });

      const amount = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
      reportData.push({ date: start.toLocaleDateString(), amount });
    }

    res.json({ success: true, days: parseInt(days), data: reportData });

  } catch (error) {
    console.error('Collection report error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate collection report' });
  }
};