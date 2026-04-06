const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.cjs');
const auth = require('../middleware/auth.cjs');
// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
// Protected route
router.get('/profile', auth, authController.getProfile);
module.exports = router;