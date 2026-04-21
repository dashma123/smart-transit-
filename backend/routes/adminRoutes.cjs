const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.cjs');
const auth = require('../middleware/auth.cjs');

router.get('/stats', auth, adminController.getStats);
router.get('/transactions', auth, adminController.getTransactions);
router.get('/low-balance-users', auth, adminController.getLowBalanceUsers);
router.post('/send-alert', auth, adminController.sendAlert);
router.post('/link-rfid', auth, adminController.linkRFID);
router.get('/passengers', auth, adminController.getAllPassengers);

module.exports = router;