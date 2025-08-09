import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="logo-row">
            <img src="/images/logo.png" alt="logo" className="logo-img" />
            <span className="logo-text">Papercart.in</span>
          </div>
          <p className="footer-tag">Your one-stop shop for quality paper and passport photos.</p>
          <div className="social-row">
            <span>🌐</span>
            <span>🐦</span>
            <span>📷</span>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Contact Us</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="copyright">
        © 2024 Paper & Photo Store. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;



