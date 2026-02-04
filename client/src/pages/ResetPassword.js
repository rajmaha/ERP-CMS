import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import './Login.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/auth/reset-password/${token}`, {
        password: formData.password
      });
      setSuccess(true);
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Reset Password - ERP CMS"
        description="Create your new password"
      />

      <div className="login-page">
        <div className="login-container">
          <div className="login-card card">
            <h1>Reset Password</h1>
            <p>Enter your new password</p>

            {success ? (
              <div className="success-message">
                <p>✓ Password reset successful!</p>
                <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                  Redirecting to login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="••••••••"
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="••••••••"
                    minLength="6"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
