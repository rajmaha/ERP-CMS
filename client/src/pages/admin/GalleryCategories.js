import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import IconPicker from '../../components/IconPicker';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import './Admin.css';

const GalleryCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📁',
    color: '#667eea',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/gallery/categories/admin', {
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
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      if (editingId) {
        await axios.put(`/api/gallery/categories/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/gallery/categories', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Category created successfully');
      }

      setFormData({ name: '', description: '', icon: '📁', color: '#667eea', order: 0, isActive: true });
      setEditingId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/gallery/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCategories(categories.filter(cat => cat._id !== id));
        toast.success('Category deleted successfully');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', icon: '📁', color: '#667eea', order: 0, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <button onClick={() => navigate('/admin/gallery')} className="back-btn">
          <FaArrowLeft /> Back to Gallery
        </button>

        <header className="admin-header">
          <h1>Gallery Categories</h1>
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
                  <label>Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>

                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  label="Icon"
                />

                <div className="form-group">
                  <label>Color</label>
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="form-control form-color"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="form-control"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <FaSave /> {editingId ? 'Update' : 'Create'} Category
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category._id} className="category-card card" style={{ borderLeftColor: category.color }}>
                <div className="category-header">
                  <span className="category-icon" style={{ fontSize: '2rem' }}>
                    {/^[\p{Emoji}]+$/u.test(category.icon) ? category.icon : <i className={`fas fa-${category.icon}`}></i>}
                  </span>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    {category.description && <p>{category.description}</p>}
                    <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="category-actions">
                  <button onClick={() => handleEdit(category)} className="btn btn-sm btn-secondary">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(category._id)} className="btn btn-sm btn-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No categories yet. Create your first category.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default GalleryCategories;
