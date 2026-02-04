import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SEO from '../components/SEO';
import { FaUser, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Profile tab
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Password tab
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = res.data.data;
      setUser(userData);
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        address: userData.address || '',
        phone: userData.phone || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Error loading profile');
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handlePhotoChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();

      Object.keys(profileData).forEach(key => {
        data.append(key, profileData[key]);
      });

      if (profilePhoto) {
        data.append('photo', profilePhoto);
      }

      await axios.put('/api/auth/profile', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local user
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO 
        title="My Profile - ERP CMS"
        description="Manage your account settings and profile information"
      />

      <div className="profile-page">
        <div className="container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your account settings</p>
          </div>

          <div className="profile-container">
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser /> Profile Settings
              </button>
              <button
                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <FaLock /> Change Password
              </button>
            </div>

            <div className="profile-content">
              {/* Profile Settings Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="profile-form card">
                  <h2>Profile Information</h2>

                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address (read-only)</label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="form-control"
                    />
                    <small>Contact support to change your email</small>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-control"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      rows="4"
                      className="form-control"
                      placeholder="Street, City, State, ZIP"
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Profile Photo</label>
                    <input
                      type="file"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="form-control"
                    />
                    <small>Recommended: Square image, max 5MB</small>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="profile-form card">
                  <h2>Change Password</h2>

                  <div className="form-group">
                    <label>Current Password *</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>New Password *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="form-control"
                      placeholder="At least 6 characters"
                    />
                    <small>Password must be at least 6 characters long</small>
                  </div>

                  <div className="form-group">
                    <label>Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="form-control"
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
