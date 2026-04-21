import React, { useState, useEffect } from "react";
import { walletAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  FiUser,
  FiMapPin,
  FiLogOut,
  FiArrowUp,
} from "react-icons/fi";
import "../style.css";

function PassengerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardNumber] = useState(user?.rfid_card_id || "Not linked");
const [cardStatus] = useState(user?.rfid_card_id ? "Active" : "Inactive");

  useEffect(() => {
    if (!user || user.role !== "passenger") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [balanceRes, transactionsRes] = await Promise.all([
          walletAPI.getBalance(),
          walletAPI.getTransactions(),
        ]);
        setBalance(balanceRes.data.balance || 0);
        setTransactions(transactionsRes.data.transactions || []);
      } catch (error) {
        console.error("Error fetching wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWalletData();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleTopUp = async () => {
    const amount = prompt("Enter amount in NPR (minimum Rs 10):");
    if (!amount || parseInt(amount) < 10) {
      alert("Minimum top-up amount is Rs 10");
      return;
    }

    try {
      const response = await walletAPI.initiateTopup(parseInt(amount));

      console.log("Top-up initiated:", response.data);

      if (response.data.pidx) {
        localStorage.setItem("pending_topup_pidx", response.data.pidx);
      }

      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert("Payment URL not received. Please try again.");
      }
    } catch (error) {
      console.error("Top-up error:", error);
      alert("Failed to initiate top-up. Please try again.");
    }
  };

  if (!user) return null;

  const totalTrips = transactions.filter((t) => t.type === "fare").length;
  const monthlySpent = transactions
    .filter((t) => {
      const date = new Date(t.timestamp);
      const now = new Date();
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + (t.type === "fare" ? t.amount : 0), 0);

  return (
    <div className="dashboard-container">
      <div className="top-bar">
        <div className="user-info">
          <FiUser /> {user.name}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="balance-section">
        <h3>Current Balance</h3>
        <p>NPR {balance.toFixed(2)}</p>
        <p>Card: {cardNumber}</p>
        <button onClick={handleTopUp}>
          <FiArrowUp /> Top-Up via Khalti
        </button>
      </div>

      <div className="stats-section">
        <div>Total Trips: {totalTrips}</div>
        <div>This Month: NPR {monthlySpent.toFixed(2)}</div>
        <div>Card Status: {cardStatus}</div>
      </div>

      <div className="trip-history">
        <h3>Recent Transactions</h3>
        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet. Top up to get started!</p>
        ) : (
          transactions.slice(0, 10).map((txn) => (
            <div key={txn._id} className="trip-card">
              <FiMapPin />
              {txn.type === "topup" ? " Wallet Top-up" : "Bus Fare"} |{" "}
              {new Date(txn.timestamp).toLocaleDateString()}{" "}
              {new Date(txn.timestamp).toLocaleTimeString()} | Amount: Rs{" "}
              {txn.amount.toFixed(2)} | Status: {txn.status}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PassengerDashboard;