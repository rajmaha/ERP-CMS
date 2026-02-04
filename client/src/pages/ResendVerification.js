import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import './ResendVerification.css';

const ResendVerification = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/resend-verification', { email });
      toast.success(res.data.message || 'Verification email sent!');
      setEmail('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Resend Verification - ERP CMS"
        description="Resend email verification link"
      />

      <div className="resend-verification-page">
        <div className="resend-verification-container">
          <div className="resend-verification-box">
            <div className="resend-verification-header">
              <h2>Resend Verification Email</h2>
              <p>Enter your email address to receive the verification link again</p>
            </div>

            <form onSubmit={handleSubmit} className="resend-verification-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <i className="icon icon-mail"></i>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-block"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>

            <div className="resend-verification-footer">
              <p>Remembered your password? <Link to="/login">Login here</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResendVerification;
