import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImage, FaVideo } from 'react-icons/fa';
import './Admin.css';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/gallery/categories/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let params = '';
      if (filter !== 'all') params += `?type=${filter}`;
      if (categoryFilter) params += `${params ? '&' : '?'}category=${categoryFilter}`;
      
      const res = await axios.get(`/api/gallery/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setLoading(false);
    }
  }, [filter, categoryFilter]);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [filter, categoryFilter, fetchItems]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/gallery/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(items.filter(item => item._id !== id));
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Error deleting item');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/gallery/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchItems();
      toast.success(currentStatus ? 'Item hidden' : 'Item shown');
    } catch (err) {
      toast.error('Error updating item');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Gallery Management</h1>
          <div className="header-actions">
            <Link to="/admin/gallery/categories" className="btn btn-secondary">
              Manage Categories
            </Link>
            <Link to="/admin/gallery/new" className="btn btn-primary">
              <FaPlus /> Add New Item
            </Link>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-tabs">
            <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              All ({items.length})
            </button>
            <button className={`tab ${filter === 'photo' ? 'active' : ''}`} onClick={() => setFilter('photo')}>
              <FaImage /> Photos
            </button>
            <button className={`tab ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>
              <FaVideo /> Videos
            </button>
          </div>

          <div className="category-filter">
            <label>Filter by Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="gallery-admin-grid">
            {items.map(item => (
              <div key={item._id} className="gallery-admin-card card">
                <div className="gallery-admin-preview">
                  {item.type === 'photo' ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="video-preview">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.title} />
                      ) : (
                        <div className="video-placeholder">
                          <FaVideo />
                        </div>
                      )}
                      <div className="video-badge">{item.videoType}</div>
                    </div>
                  )}
                </div>

                <div className="gallery-admin-info">
                  <h3>{item.title}</h3>
                  <p className="category-badge">{item.category}</p>
                  <p className="views-count">👁 {item.views} views</p>

                  <div className="gallery-admin-actions">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`status-btn ${item.isActive ? 'visible' : 'hidden'}`}
                      title={item.isActive ? 'Hide' : 'Show'}
                    >
                      {item.isActive ? <FaEye /> : <FaEyeSlash />}
                    </button>

                    <Link to={`/admin/gallery/edit/${item._id}`} className="btn btn-sm btn-secondary">
                      <FaEdit />
                    </Link>

                    <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-danger">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No gallery items yet. Add your first photo or video.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
