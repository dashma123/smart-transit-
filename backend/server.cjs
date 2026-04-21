require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('MongoDB Connection Error:', err));

// Import routes - ALL IN ONE PLACE
const authRoutes = require('./routes/authRoutes.cjs');
const khaltiRoutes = require("./routes/khaltiRoutes.cjs");
const driverRoutes = require('./routes/driverRoutes.cjs');
const walletRoutes = require('./routes/walletRoutes.cjs');
const adminRoutes = require('./routes/adminRoutes.cjs');
const reportRoutes = require('./routes/reportRoutes.cjs'); // ← MAKE SURE THIS IS HERE

// Use routes - ALL IN ONE PLACE
app.use('/api/auth', authRoutes);
app.use('/api/khalti', khaltiRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes); // ← MAKE SURE THIS IS HERE

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Smart Bus Fare Collection API is running!" });
});

// Debug logs
console.log("Khalti URL:", process.env.KHALTI_BASE_URL);
console.log("Khalti Key:", process.env.KHALTI_SECRET_KEY);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});