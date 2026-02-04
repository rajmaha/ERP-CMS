import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import './Login.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Reset link sent to your email. Check your inbox!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Forgot Password - ERP CMS"
        description="Reset your password"
      />

      <div className="login-page">
        <div className="login-container">
          <div className="login-card card">
            <h1>Forgot Password</h1>
            <p>Enter your email to reset your password</p>

            {submitted ? (
              <div className="success-message">
                <p>✓ Reset link sent to your email!</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Please check your email for password reset instructions.
                </p>
                <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '20px' }}>
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-control"
                    placeholder="admin@example.com"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <Link to="/login" style={{ color: '#0066cc', textDecoration: 'none' }}>
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
