const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController.cjs');
const auth = require('../middleware/auth.cjs');

// All driver routes require authentication
router.get('/stops', auth, driverController.getStops);
router.get('/stats', auth, driverController.getStats);
router.post('/record-stop', auth, driverController.recordStop);
router.post('/arduino-stop', driverController.arduinoRecordStop);

module.exports = router;