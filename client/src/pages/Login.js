import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { useSettings } from '../context/SettingsContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResendOption(false);

    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      // Show resend option if email verification is required
      if (err.response?.status === 403 && errorMessage.includes('verify your email')) {
        setShowResendOption(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email first');
      return;
    }

    setResendLoading(true);
    try {
      const res = await axios.post('/api/auth/resend-verification', { 
        email: formData.email 
      });
      toast.success(res.data.message || 'Verification email sent!');
      setShowResendOption(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Login - ERP CMS"
        description="Login to access the admin dashboard"
      />

      <div className="login-page">
        <div className="login-container">
          <div className="login-card card">
            <h1>Login</h1>
            <p>Access your admin dashboard</p>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {showResendOption && (
                <button 
                  type="button" 
                  onClick={handleResendVerification} 
                  className="btn btn-secondary btn-block" 
                  style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}

              <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/forgot-password" style={{ color: '#0066cc', textDecoration: 'none', fontSize: '14px' }}>
                  Forgot Password?
                </Link>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                {settings?.showRegistrationToPublic && (
                  <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#0066cc', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
