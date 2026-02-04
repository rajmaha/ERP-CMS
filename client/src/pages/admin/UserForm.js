import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminLayout from '../../components/AdminLayout';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import './UserForm.css';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phone: '',
    address: ''
  });

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data.data;
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        role: user.role,
        phone: user.phone || '',
        address: user.address || ''
      });
    } catch (error) {
      toast.error('Failed to fetch user');
      navigate('/admin/users');
    } finally {
      setIsFetching(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id, fetchUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email');
      return false;
    }

    if (!id && !formData.password) {
      toast.error('Password is required for new users');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const submitData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.password) {
        submitData.password = formData.password;
      }

      if (id) {
        await axios.put(`/api/auth/users/${id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/auth/users', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('User created successfully');
      }

      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AdminLayout>
        <div className="loading">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="user-form-container">
        <div className="form-header">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/admin/users')}
          >
            <FaArrowLeft /> Back
          </button>
          <h1>{id ? 'Edit User' : 'Add New User'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-section">
            <h2>User Information</h2>

            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="form-input"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Password</h2>

            <div className="form-group">
              <label htmlFor="password">
                Password {!id && '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={id ? 'Leave blank to keep current password' : 'Enter password'}
                className="form-input"
              />
              {!id && <small>Password must be at least 6 characters</small>}
              {id && <small>Leave blank to keep current password</small>}
            </div>

            {formData.password && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="form-input"
                  required={!!formData.password}
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              <FaSave /> {loading ? 'Saving...' : 'Save User'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/users')}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UserForm;
