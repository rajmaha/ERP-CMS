import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import HeroIconPicker from '../../components/HeroIconPicker';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './Admin.css';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    isActive: true
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/jobs/departments/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    
    if (name === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, name: value, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        await axios.put(`/api/jobs/departments/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Department updated successfully');
      } else {
        await axios.post('/api/jobs/departments', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Department created successfully');
      }
      resetForm();
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#3b82f6',
      isActive: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (department) => {
    setFormData({
      name: department.name,
      slug: department.slug,
      description: department.description || '',
      icon: department.icon || '',
      color: department.color || '#3b82f6',
      isActive: department.isActive
    });
    setEditingId(department._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/jobs/departments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(departments.filter(dept => dept._id !== id));
        toast.success('Department deleted successfully');
      } catch (err) {
        toast.error('Error deleting department');
      }
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Departments</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <FaPlus /> Add Department
          </button>
        </header>

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>{editingId ? 'Edit Department' : 'Add New Department'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="form-control"></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icon</label>
                  <HeroIconPicker 
                    value={formData.icon} 
                    onChange={(icon) => setFormData({ ...formData, icon })} 
                    label="" 
                  />
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <input type="color" name="color" value={formData.color} onChange={handleChange} className="form-control" />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                  Active
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary"><FaSave /> {editingId ? 'Update' : 'Create'}</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary"><FaTimes /> Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Icon</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map(department => (
                  <tr key={department._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: department.color, 
                          borderRadius: '4px' 
                        }}></span>
                        <strong>{department.name}</strong>
                      </div>
                    </td>
                    <td>{department.slug}</td>
                    <td>
                      {department.icon && (
                        <span style={{ fontSize: '1.5rem' }}>
                          {/^[\p{Emoji}]+$/u.test(department.icon) ? department.icon : <i className={`fas fa-${department.icon}`}></i>}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${department.isActive ? 'active' : 'inactive'}`}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(department)} className="btn btn-sm btn-secondary"><FaEdit /></button>
                        <button onClick={() => handleDelete(department._id)} className="btn btn-sm btn-danger"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No departments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DepartmentManager;
