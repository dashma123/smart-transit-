const User = require('../models/User.cjs');
const { sendSMS } = require('../services/smsService.cjs');

const LOW_BALANCE_THRESHOLD = 10;

const checkLowBalance = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) return;

    if (user.wallet_balance <= LOW_BALANCE_THRESHOLD) {
      const message = `Dear ${user.name}, your bus card balance is low (Rs. ${user.wallet_balance}). Please recharge to continue using the service.`;

      await sendSMS(user.phone, message);
      console.log(`Low balance alert sent to ${user.name} (${user.phone})`);
    }
  } catch (error) {
    console.error('Low balance check failed:', error.message);
  }
};

module.exports = { checkLowBalance };