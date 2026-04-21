import React, { useState } from "react";
import { HashLink as Link } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
import { FaWifi, FaBus, FaCheckCircle, FaTimes } from "react-icons/fa";
import heroImage from "../assets/card.jpg";
import khaltiLogo from "../assets/khalti.png";
import "../style.css";

const LandingPage = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const navigate = useNavigate();

  const openVideoModal = () => {
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
  };

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-links">
          <Link smooth to="/#how">How it works</Link>
          <Link smooth to="/#contact">Contact</Link>
          <Link smooth to="/#features">Features</Link>
          <Link to="/passenger-signup">Sign-up</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            The Future of <br />
            <span>Contactless</span> <br />
            Transit Payment
          </h1>
          <p>
            Seamless, fast, and secure RFID-based fare collection system
            for modern public transportation. Say goodbye to cash and tickets!
          </p>
          <div className="hero-buttons">
            <button className="btn primary" onClick={goToLogin}>Start Now</button>
            <button className="btn outline" onClick={openVideoModal}>
              Watch Demo
            </button>
          </div>
          <div className="stats">
            <div><strong>50k+</strong><span>Active Users</span></div>
            <div><strong>200+</strong><span>Buses</span></div>
            <div><strong>1M+</strong><span>Transactions</span></div>
          </div>
        </div>
        <div className="hero-right">
          <img src={heroImage} alt="Smart Transit" className="hero-image" />
        </div>
      </section>

      {/* VIDEO MODAL */}
      {showVideoModal && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeVideoModal}>
              <FaTimes size={24} />
            </button>
            <div className="video-container">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/sQXJEUT88_w"
                title="RFID Bus Payment Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* FEATURES */}
      <section className="features" id="features">
        <h2>Powerful Features</h2>
        <p>Everything you need for modern transit payment</p>
        <div className="feature-cards">
          <div className="feature-card">
            <FaWifi size={32} />
            <h4>RFID Card<br />Payment</h4>
          </div>
          <div className="feature-card">
            <FaBus size={32} />
            <h4>Fare<br />Validation</h4>
          </div>
          <div className="feature-card">
            <img src={khaltiLogo} alt="Khalti" />
            <h4>Khalti<br />Recharge</h4>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <h2>How It Works?</h2>
        <p>Get started in 3 simple steps</p>
        <div className="steps">
          <div className="step">Get Your<br />RFID Card</div>
          <div className="step">Tap to<br />Enter & Exit</div>
          <div className="step">Recharge<br />Anytime</div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="why">
        <h2>Why Choose Smart Transit?</h2>
        <ul>
          <li><FaCheckCircle size={18} /> Saves time</li>
          <li><FaCheckCircle size={18} /> Saves money</li>
          <li><FaCheckCircle size={18} /> Reduces stress</li>
        </ul>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-grid">
          <div>
            <h4>SMART TRANSIT</h4>
            <p>
              Making public transportation smarter,
              faster, and more convenient.
            </p>
          </div>
          <div>
            <h4>QUICK LINKS</h4>
            <p>Features</p>
            <p>Contact</p>
            <p>How it works</p>
          </div>
          <div>
            <h4>SUPPORT</h4>
            <p>Terms and Conditions</p>
            <p>Privacy</p>
          </div>
          <div>
            <h4>CONTACT</h4>
            <p>Email: info@smarttransit.com</p>
            <p>Phone: 9863330256</p>
          </div>
        </div>
        <p className="copyright">
          © 2025 Smart Transit. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;