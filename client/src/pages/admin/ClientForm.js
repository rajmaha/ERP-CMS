import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import HeroImagePicker from '../../components/HeroImagePicker';
import './Form.css';

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website: '',
    description: '',
    isActive: true,
    isFeatured: false
  });

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error('Error loading client');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchClient();
  }, [id, fetchClient]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (id) {
        await axios.put(`/api/clients/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Client updated successfully');
      } else {
        await axios.post('/api/clients', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Client created successfully');
      }
      navigate('/admin/clients');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving client');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <button onClick={() => navigate('/admin/clients')} className="back-btn">
          <FaArrowLeft /> Back to Clients
        </button>

        <form onSubmit={handleSubmit} className="form-container card">
          <h1>{id ? 'Edit Client' : 'Create New Client'}</h1>

          <div className="form-group">
            <label>Client Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
          </div>

          <div className="form-group">
            <label>Logo *</label>
            <HeroImagePicker
              value={formData.logo}
              onChange={(url) => setFormData({ ...formData, logo: url })}
              label=""
            />
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input type="url" name="website" value={formData.website} onChange={handleChange} className="form-control" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="form-control"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />Active</label>
            </div>
            <div className="form-group">
              <label className="checkbox-label"><input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />Featured</label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Client'}</button>
            <button type="button" onClick={() => navigate('/admin/clients')} className="btn btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ClientForm;
