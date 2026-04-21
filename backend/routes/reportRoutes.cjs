const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController.cjs');
const auth = require('../middleware/auth.cjs');

// All report routes require admin authentication
router.get('/financial', auth, reportController.getFinancialReport);
router.get('/collection', auth, reportController.getCollectionReport);

module.exports = router;