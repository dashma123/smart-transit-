import React, { useState, useEffect } from "react";
import { adminAPI, reportAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { FiUser, FiLogOut, FiAlertCircle, FiMapPin } from "react-icons/fi";
import "../style.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("passengers");
  const [stats, setStats] = useState({ totalPassengers: 0, totalDrivers: 0, totalCollection: 0, lowBalanceAlerts: 0 });
  const [transactions, setTransactions] = useState([]);
  const [lowBalanceUsers, setLowBalanceUsers] = useState([]);
  const [allPassengers, setAllPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("monthly");
  const [collectionDays, setCollectionDays] = useState("7");
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [rfidSearch, setRfidSearch] = useState("");
  const [rfidSearchResult, setRfidSearchResult] = useState(null);
  const [rfidCardId, setRfidCardId] = useState("");
  const [rfidLoading, setRfidLoading] = useState(false);
  const [rfidMessage, setRfidMessage] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, transactionsRes, lowBalanceRes, passengersRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getTransactions(),
          adminAPI.getLowBalanceUsers(),
          adminAPI.getAllPassengers(),
        ]);
        setStats({
          totalPassengers: statsRes.data.totalPassengers || 0,
          totalDrivers: statsRes.data.totalDrivers || 0,
          totalCollection: statsRes.data.totalCollection || 0,
          lowBalanceAlerts: statsRes.data.lowBalanceAlerts || 0,
        });
        setTransactions(transactionsRes.data.transactions || []);
        setLowBalanceUsers(lowBalanceRes.data.users || []);
        setAllPassengers(passengersRes.data.passengers || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === "admin") fetchAdminData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendAlert = async (userId) => {
    try {
      const response = await adminAPI.sendAlert(userId);
      if (response.data.success) alert("Alert sent successfully!");
    } catch (error) {
      alert("Failed to send alert");
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      setReportLoading(true);
      let response;
      if (type === "financial") response = await reportAPI.getFinancialReport(reportType);
      else if (type === "collection") response = await reportAPI.getCollectionReport(collectionDays);
      setReportData(response.data);
      alert("Report generated successfully!");
    } catch (error) {
      alert("Failed to generate report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSearchPassenger = () => {
    if (!rfidSearch.trim()) return;
    const found = allPassengers.find(
      (p) =>
        p.name.toLowerCase().includes(rfidSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(rfidSearch.toLowerCase())
    );
    if (found) {
      setRfidSearchResult(found);
      setRfidMessage(null);
    } else {
      setRfidSearchResult(null);
      setRfidMessage({ type: "error", text: "Passenger not found." });
    }
  };

  const handleLinkRfid = async () => {
    if (!rfidSearchResult || !rfidCardId.trim()) return;
    try {
      setRfidLoading(true);
      setRfidMessage(null);
      await adminAPI.linkRfidCard(rfidSearchResult._id, rfidCardId.trim());
      setRfidMessage({ type: "success", text: `RFID card linked to ${rfidSearchResult.name}!` });
      setRfidSearchResult({ ...rfidSearchResult, rfid_card_id: rfidCardId.trim() });
      setRfidCardId("");
    } catch (error) {
      setRfidMessage({ type: "error", text: "Failed to link RFID card." });
    } finally {
      setRfidLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="admin-dashboard-container">
      {/* Top Bar */}
      <div className="admin-top-bar">
        <div className="admin-user-info">
          <FiUser className="admin-user-icon" /> {user.name}
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="management-section">
        <h3 className="management-title">Management</h3>
        <div className="admin-tabs">
          <button className={`admin-tab-btn ${activeTab === "passengers" ? "active" : ""}`} onClick={() => setActiveTab("passengers")}>Passengers</button>
          <button className={`admin-tab-btn ${activeTab === "balance" ? "active" : ""}`} onClick={() => setActiveTab("balance")}>Balance</button>
          <button className={`admin-tab-btn ${activeTab === "trips" ? "active" : ""}`} onClick={() => setActiveTab("trips")}>Trip(stops)</button>
          <button className={`admin-tab-btn ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>Reports</button>
          <button className={`admin-tab-btn ${activeTab === "rfid" ? "active" : ""}`} onClick={() => setActiveTab("rfid")}>Link RFID</button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px", color: "#999" }}>Loading admin data...</p>
      ) : (
        <>
          {/* PASSENGERS TAB */}
          {activeTab === "passengers" && (
            <>
              <div className="stats-cards">
                <div className="admin-stat-card">
                  <span className="stat-icon"></span>
                  <div className="stat-content">
                    <p className="stat-label">Total Passengers</p>
                    <p className="stat-value">{stats.totalPassengers.toLocaleString()}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-icon"></span>
                  <div className="stat-content">
                    <p className="stat-label">Total Collection</p>
                    <p className="stat-value">NPR {stats.totalCollection.toLocaleString()}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-icon"></span>
                  <div className="stat-content">
                    <p className="stat-label">Low Balance Alerts</p>
                    <p className="stat-value">{stats.lowBalanceAlerts}</p>
                  </div>
                </div>
              </div>

              <div className="transactions-section">
  <h3 className="section-title">Recent Transactions</h3>
  <div className="transactions-grid">
    {transactions.length === 0 ? (
      <p>No transactions yet.</p>
    ) : (
      (showAllTransactions ? transactions : transactions.slice(0, 6)).map((t) => (
        <div key={t.id} className="transaction-card">
          <div className="transaction-details">
            <FiMapPin className="transaction-icon" />
            <div className="transaction-info">
              <p className="transaction-route">{t.description || "Bus Fare"}</p>
              <p className="transaction-passenger">{t.passenger} — {t.email}</p>
              <p className="transaction-datetime">
                {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <p className="transaction-amount">Rs {t.amount.toFixed(2)}</p>
        </div>
      ))
    )}
  </div>
  {transactions.length > 6 && (
    <button className="show-all-btn" onClick={() => setShowAllTransactions(!showAllTransactions)}>
      {showAllTransactions ? "Show Less" : "Show All"}
    </button>
  )}
</div>
              <div className="low-balance-section">
                <div className="alert-header">
                  <FiAlertCircle className="alert-icon" />
                  <h3 className="alert-title">Low Balance Alert</h3>
                </div>
                {lowBalanceUsers.length === 0 ? (
                  <p>No low balance users.</p>
                ) : (
                  <>
                    {lowBalanceUsers.slice(0, 1).map((u) => (
                      <div key={u.id} className="low-balance-card">
                        <div className="user-details">
                          <p className="user-name">{u.name}</p>
                          <p className="user-rfid">{u.rfid}</p>
                          <p className="user-last-used">Last used: {u.lastUsed}</p>
                        </div>
                        <p className="user-balance">Rs {u.balance.toFixed(2)}</p>
                      </div>
                    ))}
                    <button className="send-alert-btn" onClick={() => handleSendAlert(lowBalanceUsers[0]?.id)}>
                      Send Alert to Low User
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* BALANCE TAB */}
          {activeTab === "balance" && (
            <div className="balance-tab-content">
              <h3>Balance Management</h3>
              <div className="stats-cards" style={{ marginTop: "20px" }}>
                <div className="admin-stat-card">
                  <span className="stat-icon"></span>
                  <div className="stat-content">
                    <p className="stat-label">Total Collection</p>
                    <p className="stat-value">NPR {stats.totalCollection.toLocaleString()}</p>
                  </div>
                </div>
                <div className="admin-stat-card">
                  <span className="stat-icon"></span>
                  <div className="stat-content">
                    <p className="stat-label">Low Balance Users</p>
                    <p className="stat-value">{stats.lowBalanceAlerts}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRIPS TAB */}
          {activeTab === "trips" && (
            <div className="trips-tab-content">
              <h3>Driver Trips & Stops</h3>
              <div className="transactions-grid" style={{ marginTop: "20px" }}>
                {transactions.filter((t) => t.type === "fare").length === 0 ? (
                  <p>No trip data yet.</p>
                ) : (
                  transactions.filter((t) => t.type === "fare").slice(0, 8).map((t) => (
                    <div key={t.id} className="transaction-card">
                      <div className="transaction-details">
                        <FiMapPin className="transaction-icon" />
                        <div className="transaction-info">
                          <p className="transaction-route">Bus Fare</p>
                          <p className="transaction-passenger">{t.passenger}</p>
                          <p className="transaction-datetime">
                            {new Date(t.timestamp).toLocaleDateString()} {new Date(t.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p className="transaction-amount">Rs {t.amount.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="reports-container">
              <h2 className="reports-title">Generate Report</h2>
              <div className="reports-grid">
                <div className="report-box">
                  <h3>Financial Report</h3>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                    <option value="monthly">Monthly Report</option>
                    <option value="yearly">Yearly Report</option>
                  </select>
                  <button className="generate-btn" onClick={() => handleGenerateReport("financial")} disabled={reportLoading}>
                    {reportLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
                <div className="report-box">
                  <h3>Collection Report</h3>
                  <select value={collectionDays} onChange={(e) => setCollectionDays(e.target.value)}>
                    <option value="7">Last 7 Days</option>
                    <option value="15">Last 15 Days</option>
                    <option value="30">Last 30 Days</option>
                  </select>
                  <button className="generate-btn" onClick={() => handleGenerateReport("collection")} disabled={reportLoading}>
                    {reportLoading ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
              {reportData && (
                <div className="report-results">
                  <h3>Report Results - {reportData.type || "Daily Collection"}</h3>
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>{reportData.type ? "Period" : "Date"}</th>
                        <th style={{ textAlign: "right" }}>Amount (NPR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.data.map((item, index) => (
                        <tr key={index}>
                          <td>{item.period || item.date}</td>
                          <td style={{ textAlign: "right" }}>Rs {item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total</td>
                        <td style={{ textAlign: "right" }}>
                          Rs {reportData.data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* RFID TAB */}
          {activeTab === "rfid" && (
            <div className="rfid-section">
              <h3 className="section-title">Link RFID Card to Passenger</h3>
              <div className="rfid-search-box">
                <label className="rfid-label">Search Passenger by Name or Email</label>
                <div className="rfid-search-row">
                  <input
                    type="text"
                    className="rfid-input"
                    placeholder="Enter name or email..."
                    value={rfidSearch}
                    onChange={(e) => setRfidSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchPassenger()}
                  />
                  <button className="rfid-search-btn" onClick={handleSearchPassenger} disabled={rfidLoading}>
                    {rfidLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              {rfidSearchResult && (
                <div className="rfid-result-card">
                  <div className="rfid-passenger-info">
                    <p className="rfid-passenger-name">{rfidSearchResult.name}</p>
                    <p className="rfid-passenger-email">{rfidSearchResult.email}</p>
                    <p className="rfid-passenger-status">
                      Current RFID:{" "}
                      {rfidSearchResult.rfid_card_id
                        ? <span className="rfid-linked">{rfidSearchResult.rfid_card_id}</span>
                        : <span className="rfid-unlinked">Not linked</span>
                      }
                    </p>
                  </div>
                  <div className="rfid-link-box">
                    <label className="rfid-label">Enter RFID Card ID</label>
                    <input
                      type="text"
                      className="rfid-input"
                      placeholder="e.g. CA 77 16 06"
                      value={rfidCardId}
                      onChange={(e) => setRfidCardId(e.target.value)}
                    />
                    <button className="rfid-link-btn" onClick={handleLinkRfid} disabled={rfidLoading || !rfidCardId.trim()}>
                      {rfidLoading ? "Linking..." : "Link Card"}
                    </button>
                  </div>
                </div>
              )}

              {rfidMessage && (
                <div className={`rfid-message ${rfidMessage.type}`}>
                  {rfidMessage.text}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;