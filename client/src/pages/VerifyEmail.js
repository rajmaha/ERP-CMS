import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.post(`/api/auth/verify-email/${token}`);
        setIsSuccess(true);
        setMessage(res.data.message);
        
        // Auto login
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      } catch (err) {
        setIsSuccess(false);
        setMessage(err.response?.data?.message || 'Email verification failed');
        toast.error(err.response?.data?.message || 'Email verification failed');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <>
      <SEO 
        title="Verify Email - ERP CMS"
        description="Email verification"
      />

      <div className="verify-email-page">
        <div className="verify-email-container">
          <div className={`verify-email-box ${isSuccess ? 'success' : 'error'}`}>
            {loading ? (
              <>
                <div className="spinner"></div>
                <h2>Verifying your email...</h2>
              </>
            ) : (
              <>
                <div className={`status-icon ${isSuccess ? 'success' : 'error'}`}>
                  {isSuccess ? '✓' : '✗'}
                </div>
                <h2>{isSuccess ? 'Email Verified!' : 'Verification Failed'}</h2>
                <p>{message}</p>
                {isSuccess ? (
                  <p className="redirect-message">Redirecting to dashboard...</p>
                ) : (
                  <button 
                    onClick={() => navigate('/login')}
                    className="btn btn-primary"
                  >
                    Back to Login
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
