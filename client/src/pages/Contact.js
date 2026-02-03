import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SEO from '../components/SEO';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');

  useEffect(() => {
    fetchSettings();
    
    // Load reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        console.log('reCAPTCHA ready');
      });
    }
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      console.log('Settings response:', res.data); // Debug log
      if (res.data && res.data.data) {
        setSettings(res.data.data);
        console.log('Map URL:', res.data.data.mapUrl); // Debug log
        console.log('Show Map:', res.data.data.showMap); // Debug log
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Get reCAPTCHA token only if enabled
    let captchaToken = recaptchaToken;
    if (settings?.enableRecaptchaContact && window.grecaptcha && settings?.recaptchaSiteKey) {
      try {
        captchaToken = await window.grecaptcha.execute(settings.recaptchaSiteKey, { action: 'submit' });
      } catch (err) {
        console.error('reCAPTCHA error:', err);
      }
    }

    try {
      await axios.post('/api/contact', {
        ...formData,
        recaptchaToken: captchaToken
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Extract map URL from iframe if full iframe code is provided
  const getMapUrl = (mapData) => {
    if (!mapData) {
      console.log('No map data provided');
      return null;
    }
    
    console.log('Processing map data:', mapData); // Debug log
    
    // If it's already a URL, return it
    if (mapData.startsWith('https://') || mapData.startsWith('http://')) {
      console.log('Returning direct URL:', mapData);
      return mapData;
    }
    
    // If it's full iframe code, extract the src URL
    const srcMatch = mapData.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      console.log('Extracted URL from iframe:', srcMatch[1]);
      return srcMatch[1];
    }
    
    console.log('Could not extract URL from:', mapData);
    return null;
  };

  return (
    <>
      <SEO 
        title="Contact Us"
        description="Get in touch with us. We'd love to hear from you."
      />

      <div className="contact-page">
        <section className="contact-hero">
          <div className="container">
            <h1>Contact Us</h1>
            <p>We'd love to hear from you. Send us a message!</p>
          </div>
        </section>

        <section className="contact-content">
          <div className="container">
            <div className="contact-wrapper">
              {/* Contact Information Column */}
              <div className="contact-info">
                <h2>Get In Touch</h2>
                
                <div className="info-item">
                  <div className="info-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div className="info-content">
                    <h3>Address</h3>
                    <p>{settings?.address || '123 Business Street, City, Country'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaPhone />
                  </div>
                  <div className="info-content">
                    <h3>Phone</h3>
                    <p>
                      <a href={`tel:${settings?.phone}`}>
                        {settings?.phone || '+1 (234) 567-8900'}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <FaEnvelope />
                  </div>
                  <div className="info-content">
                    <h3>Email</h3>
                    <p>
                      <a href={`mailto:${settings?.email}`}>
                        {settings?.email || 'info@example.com'}
                      </a>
                    </p>
                  </div>
                </div>

                {(settings?.facebook || settings?.twitter || settings?.linkedin || settings?.instagram) && (
                  <div className="social-links">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                      {settings?.facebook && (
                        <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaFacebook />
                        </a>
                      )}
                      {settings?.twitter && (
                        <a href={settings.twitter} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaTwitter />
                        </a>
                      )}
                      {settings?.linkedin && (
                        <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaLinkedin />
                        </a>
                      )}
                      {settings?.instagram && (
                        <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="social-icon">
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Form Column */}
              <div className="contact-form-wrapper">
                <h2>Send Us a Message</h2>

                {success && (
                  <div className="success-message">
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Your Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Your Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Tell us what's on your mind..."
                    ></textarea>
                  </div>

                  {settings?.enableRecaptchaContact && settings?.recaptchaSiteKey && (
                    <div className="form-group recaptcha-notice">
                      <small>This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</small>
                    </div>
                  )}

                  <button type="submit" className="submit-btn" disabled={loading}>
                    <FaPaperPlane />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        {(() => {
          console.log('Rendering map section check:', {
            hasSettings: !!settings,
            showMap: settings?.showMap,
            hasMapUrl: !!settings?.mapUrl
          });
          
          const mapUrl = settings?.mapUrl ? getMapUrl(settings.mapUrl) : null;
          console.log('Final map URL:', mapUrl);
          
          if (settings && settings.showMap !== false && mapUrl) {
            return (
              <section className="map-section">
                <div className="container" style={{ padding: 0 }}>
                  <h2 style={{ textAlign: 'center', padding: '2rem 0 1rem 0' }}>Find Us Here</h2>
                  <div className="map-container">
                    <iframe
                      src={mapUrl}
                      width="100%"
                      height="450"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map"
                    ></iframe>
                  </div>
                </div>
              </section>
            );
          }
          
          console.log('Map section not rendered - conditions not met');
          return null;
        })()}
      </div>
    </>
  );
};

export default Contact;
