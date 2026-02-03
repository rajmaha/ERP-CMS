import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaStar, FaRegStar } from 'react-icons/fa';
import './Admin.css';

const AdminTutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/tutorials/categories/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTutorials = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      let params = '';
      if (statusFilter !== 'all') params += `?status=${statusFilter}`;
      if (difficultyFilter !== 'all') params += `${params ? '&' : '?'}difficulty=${difficultyFilter}`;
      if (categoryFilter) params += `${params ? '&' : '?'}category=${categoryFilter}`;
      
      const res = await axios.get(`/api/tutorials/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTutorials(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tutorials:', err);
      setLoading(false);
    }
  }, [statusFilter, difficultyFilter, categoryFilter]);

  useEffect(() => {
    fetchCategories();
    fetchTutorials();
  }, [statusFilter, difficultyFilter, categoryFilter, fetchTutorials]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tutorial?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/tutorials/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTutorials(tutorials.filter(t => t._id !== id));
        toast.success('Tutorial deleted successfully');
      } catch (err) {
        toast.error('Error deleting tutorial');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tutorials/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTutorials();
      toast.success(currentStatus ? 'Tutorial hidden' : 'Tutorial shown');
    } catch (err) {
      toast.error('Error updating tutorial');
    }
  };

  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/tutorials/${id}`, 
        { isFeatured: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchTutorials();
      toast.success(currentStatus ? 'Removed from featured' : 'Added to featured');
    } catch (err) {
      toast.error('Error updating tutorial');
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'beginner':
        return '#27ae60';
      case 'intermediate':
        return '#f39c12';
      case 'advanced':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Tutorial Management</h1>
          <div className="header-actions">
            <Link to="/admin/tutorials/categories" className="btn btn-secondary">
              Manage Categories
            </Link>
            <Link to="/admin/tutorials/new" className="btn btn-primary">
              <FaPlus /> Add New Tutorial
            </Link>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-tabs">
            <button className={`tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
              All ({tutorials.length})
            </button>
            <button className={`tab ${statusFilter === 'published' ? 'active' : ''}`} onClick={() => setStatusFilter('published')}>
              Published
            </button>
            <button className={`tab ${statusFilter === 'draft' ? 'active' : ''}`} onClick={() => setStatusFilter('draft')}>
              Draft
            </button>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Difficulty:</label>
              <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="form-control">
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category:</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-control">
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {tutorials.length > 0 ? (
          <div className="tutorials-admin-grid">
            {tutorials.map(tutorial => (
              <div key={tutorial._id} className="tutorial-admin-card card">
                <div className="tutorial-admin-header">
                  <h3>{tutorial.title}</h3>
                  <div className="header-badges">
                    <span className="status-badge" style={{ backgroundColor: tutorial.status === 'published' ? '#27ae60' : '#95a5a6' }}>
                      {tutorial.status}
                    </span>
                    <span className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(tutorial.difficulty) }}>
                      {tutorial.difficulty}
                    </span>
                  </div>
                </div>

                <div className="tutorial-admin-info">
                  <p className="category-badge">{tutorial.category?.name}</p>
                  {tutorial.duration && <p><strong>Duration:</strong> {tutorial.duration} min</p>}
                  <p><strong>Views:</strong> {tutorial.views}</p>
                  <p><strong>Author:</strong> {tutorial.author?.name}</p>
                </div>

                <div className="tutorial-admin-actions">
                  <button
                    onClick={() => handleToggleActive(tutorial._id, tutorial.isActive)}
                    className={`action-btn ${tutorial.isActive ? 'visible' : 'hidden'}`}
                    title={tutorial.isActive ? 'Hide' : 'Show'}
                  >
                    {tutorial.isActive ? <FaEye /> : <FaEyeSlash />}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(tutorial._id, tutorial.isFeatured)}
                    className={`action-btn ${tutorial.isFeatured ? 'featured' : ''}`}
                    title={tutorial.isFeatured ? 'Remove from featured' : 'Add to featured'}
                  >
                    {tutorial.isFeatured ? <FaStar /> : <FaRegStar />}
                  </button>

                  <Link to={`/admin/tutorials/edit/${tutorial._id}`} className="btn btn-sm btn-secondary">
                    <FaEdit />
                  </Link>

                  <button onClick={() => handleDelete(tutorial._id)} className="btn btn-sm btn-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No tutorials found. Create your first tutorial.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTutorials;
