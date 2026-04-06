const express = require("express");
const axios = require("axios");
const router = express.Router();
const User = require('../models/User.cjs'); // ADD THIS
const auth = require('../middleware/auth.cjs'); // ADD THIS

// Payment initiation endpoint
router.post("/initiate", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.userId;

    // Generate unique order ID
    const orderId = `ORDER_${userId}_${Date.now()}`;

    // Get user info
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
      {
        return_url: "http://localhost:5173/payment-success",
        website_url: "http://localhost:5173",
        amount: amount, // Amount in paisa
        purchase_order_id: orderId,
        purchase_order_name: "Smart Bus Wallet Top-up",
        customer_info: {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
      },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Khalti Payment Initiated:", response.data);
    
    res.json({
      success: true,
      pidx: response.data.pidx,
      payment_url: response.data.payment_url
    });

  } catch (error) {
    console.error("❌ Khalti Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: "Khalti initiation failed",
      details: error.response?.data 
    });
  }
});

// Payment verification endpoint - FIXED VERSION
router.post("/verify", auth, async (req, res) => {
  try {
    const { pidx } = req.body;
    const userId = req.userId; // From auth middleware

    console.log("🔍 Verifying payment for pidx:", pidx);

    // Step 1: Verify with Khalti
    const response = await axios.post(
      `${process.env.KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(" Khalti Verification Result:", response.data);

    // Step 2: Check if payment is completed
    if (response.data.status === "Completed") {
      
      // Step 3: Get user from database
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: "User not found" 
        });
      }

      // Step 4: Get amount from Khalti (in paisa)
      const amount = response.data.total_amount;

      console.log(`💰 Adding ${amount} NRP (Rs ${amount}) to wallet`);

      // Step 5: Update wallet balance
      user.walletBalance += amount;

      // Step 6: Add transaction record
      user.walletTransactions.push({
        type: 'topup',
        amount: amount,
        description: `Khalti top-up - Payment ID: ${pidx}`,
        status: 'completed',
        timestamp: new Date()
      });

      // Step 7: Save to database
      await user.save();

      console.log(`✅ Wallet updated! New balance: Rs ${user.walletBalance / 100}`);

      // Step 8: Send success response
      res.json({ 
        success: true, 
        message: "Payment verified and wallet updated successfully!",
        newBalance: user.walletBalance,
        amount: amount,
        paymentData: response.data 
      });

    } else if (response.data.status === "Pending") {
      res.json({ 
        success: false, 
        message: "Payment is still pending. Please try again in a moment.",
        status: response.data.status
      });
    } else {
      res.json({ 
        success: false, 
        message: `Payment failed. Status: ${response.data.status}`,
        status: response.data.status
      });
    }

  } catch (error) {
    console.error("❌ Verification Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      error: "Payment verification failed",
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;