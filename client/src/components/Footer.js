import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import axios from 'axios';
import './Footer.css';

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setSettings(res.data.data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3 className="footer-title">
                <span className="logo-text">ERP</span>
                <span className="logo-accent">CMS</span>
              </h3>
              <p className="footer-desc">
                {settings.siteDescription || 'Modern CMS for ERP System with dynamic features and SEO optimization.'}
              </p>
              <div className="social-links">
                {settings.socialMedia?.facebook && (
                  <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <FaFacebook />
                  </a>
                )}
                {settings.socialMedia?.twitter && (
                  <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                )}
                {settings.socialMedia?.linkedin && (
                  <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <FaLinkedin />
                  </a>
                )}
                {settings.socialMedia?.instagram && (
                  <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                )}
                {settings.socialMedia?.youtube && (
                  <a href={settings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <FaYoutube />
                  </a>
                )}
              </div>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/products">Products</Link></li>
                <li><Link to="/portfolio">Portfolio</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Resources</h4>
              <ul className="footer-links">
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/pages/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/pages/terms-of-service">Terms of Service</Link></li>
                <li><Link to="/admin">Admin</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-heading">Contact Info</h4>
              <ul className="footer-contact">
                {settings.contactEmail && (
                  <li>
                    <strong>Email:</strong><br />
                    <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
                  </li>
                )}
                {settings.contactPhone && (
                  <li>
                    <strong>Phone:</strong><br />
                    <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a>
                  </li>
                )}
                {settings.address && (
                  <li>
                    <strong>Address:</strong><br />
                    {settings.address}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} {settings.siteName || 'ERP CMS'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
