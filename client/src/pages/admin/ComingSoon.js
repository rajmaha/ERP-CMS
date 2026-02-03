import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const ComingSoon = ({ title, description }) => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="admin-page">
        <button onClick={() => navigate('/admin')} className="back-btn">
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
            {title}
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
            {description}
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            This module is coming soon. Stay tuned!
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ComingSoon;
