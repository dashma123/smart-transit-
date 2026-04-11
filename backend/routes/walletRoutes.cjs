const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const Transaction = require('../models/Transaction.cjs');
const axios = require('axios');
const { checkLowBalance } = require('../utils/checkLowBalance.cjs');
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('wallet_balance name email');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      balance: user.wallet_balance || 0,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Balance Error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.post('/topup/initiate', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const amountNum = parseInt(amount);
    if (!amountNum || amountNum < 10) {
      return res.status(400).json({ error: 'Minimum top-up amount is Rs 10' });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const response = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
      {
        return_url: `http://localhost:5173/payment-success`,
        website_url: "http://localhost:5173",
        amount: amountNum * 100,
        purchase_order_id: `TOPUP_${user._id}_${Date.now()}`,
        purchase_order_name: "Wallet Top-up",
        customer_info: { name: user.name, email: user.email, phone: user.phone }
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const currentBalance = typeof user.wallet_balance === 'number' && !isNaN(user.wallet_balance)
      ? user.wallet_balance : 0;
    const calculatedAfterBalance = currentBalance + amountNum;
    console.log('Transaction Debug:', {
      currentBalance, amountNPR: amountNum, amountPaisa: amountNum * 100,
      calculatedAfterBalance, userId: user._id
    });
    const transaction = new Transaction({
      userId: user._id,
      type: 'topup',
      amount: amountNum,
      beforeBalance: currentBalance,
      afterBalance: calculatedAfterBalance,
      status: 'pending',
      paymentMethod: 'khalti',
      paymentId: response.data.pidx,
      description: 'Wallet top-up via Khalti'
    });
    await transaction.save();
    res.json({
      message: 'Top-up initiated',
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      amount: amountNum,
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Top-up Initiate Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate top-up', details: error.response?.data || error.message });
  }
});

router.post('/topup/verify', authenticateToken, async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ error: 'Payment ID (pidx) is required' });
    }
    const khaltiResponse = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (khaltiResponse.data.status !== 'Completed') {
      return res.status(400).json({ error: 'Payment not completed', status: khaltiResponse.data.status });
    }
    let transaction = await Transaction.findOne({ paymentId: pidx, userId: req.userId });
    const user = await User.findById(req.userId);
    const currentBalance = typeof user.wallet_balance === 'number' && !isNaN(user.wallet_balance)
      ? user.wallet_balance : 0;
    if (!transaction) {
      const amountNPR = khaltiResponse.data.total_amount / 100;
      const newBalance = currentBalance + amountNPR;
      user.wallet_balance = newBalance;
      await user.save();
      transaction = await Transaction.create({
        userId: req.userId,
        type: 'topup',
        amount: amountNPR,
        beforeBalance: currentBalance,
        afterBalance: newBalance,
        status: 'completed',
        paymentMethod: 'khalti',
        paymentId: pidx,
        description: 'Khalti top-up (recovered)'
      });
      return res.json({ success: true, message: 'Top-up successful', newBalance: newBalance });
    }
    if (transaction.status === 'completed') {
      return res.status(400).json({ error: 'Transaction already completed' });
    }
    const topupAmount = typeof transaction.amount === 'number' && !isNaN(transaction.amount)
      ? transaction.amount : 0;
    const newBalance = currentBalance + topupAmount;
    user.wallet_balance = newBalance;
    await user.save();
    transaction.status = 'completed';
    transaction.afterBalance = newBalance;
    await transaction.save();
    res.json({
      success: true,
      message: 'Top-up successful',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        beforeBalance: currentBalance,
        afterBalance: newBalance
      },
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Top-up Verify Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to verify top-up', details: error.response?.data || error.message });
  }
});

router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json({ transactions: transactions });
  } catch (error) {
    console.error('Transaction History Error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/link-rfid', authenticateToken, async (req, res) => {
  try {
    const { rfid_card_id, userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { rfid_card_id: rfid_card_id },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      success: true,
      message: `RFID card linked to ${user.name}`,
      rfid_card_id: user.rfid_card_id
    });
  } catch (error) {
    console.error('Link RFID Error:', error);
    res.status(500).json({ error: 'Failed to link RFID card', details: error.message });
  }
});

router.post('/rfid-payment', async (req, res) => {
  try {
    const { rfid_uid, stop_number, fare } = req.body;
    const user = await User.findOne({ rfid_card_id: rfid_uid });
    if (!user) return res.status(404).json({ error: 'Card not registered' });
    if (user.wallet_balance < fare) return res.status(400).json({ error: 'Insufficient balance' });
    const beforeBalance = user.wallet_balance;
    const afterBalance = beforeBalance - fare;
    user.wallet_balance = afterBalance;
    await user.save();
    const transaction = new Transaction({
      userId: user._id,
      type: 'fare',
      amount: fare,
      beforeBalance: beforeBalance,
      afterBalance: afterBalance,
      status: 'completed',
      paymentMethod: 'rfid',
      description: `Bus fare deducted at stop ${stop_number}`
    });
    await transaction.save();
    await checkLowBalance(user._id); // ✅ ONLY HERE
    res.json({
      success: true,
      message: 'Payment successful',
      passenger: user.name,
      fare: fare,
      stop: stop_number,
      beforeBalance,
      afterBalance
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

module.exports = router;