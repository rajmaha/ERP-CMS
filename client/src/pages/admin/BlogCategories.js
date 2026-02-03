import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import HeroIconPicker from '../../components/HeroIconPicker';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import './Admin.css';

const BlogCategories = () => {
  const [categories, setCategories] = useState([]);
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/blog/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
        await axios.put(`/api/blog/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/blog/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
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

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      isActive: category.isActive
    });
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/blog/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(categories.filter(cat => cat._id !== id));
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error('Error deleting category');
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
          <h1>Blog Categories</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <FaPlus /> Add Category
          </button>
        </header>

        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>{editingId ? 'Edit Category' : 'Add New Category'}</h2>
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
              {categories.length > 0 ? (
                categories.map(category => (
                  <tr key={category._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: '20px', 
                          height: '20px', 
                          backgroundColor: category.color, 
                          borderRadius: '4px' 
                        }}></span>
                        <strong>{category.name}</strong>
                      </div>
                    </td>
                    <td>{category.slug}</td>
                    <td>
                      {category.icon && (
                        <span style={{ fontSize: '1.5rem' }}>
                          {/^[\p{Emoji}]+$/u.test(category.icon) ? category.icon : <i className={`fas fa-${category.icon}`}></i>}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(category)} className="btn btn-sm btn-secondary"><FaEdit /></button>
                        <button onClick={() => handleDelete(category._id)} className="btn btn-sm btn-danger"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No categories found
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

export default BlogCategories;
