import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Admin.css';

const PortfolioList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/portfolio/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(items.filter(item => item._id !== id));
        toast.success('Portfolio item deleted successfully');
      } catch (err) {
        toast.error('Error deleting portfolio item');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/portfolio/${id}`, 
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchItems();
      toast.success(currentStatus ? 'Portfolio hidden' : 'Portfolio shown');
    } catch (err) {
      toast.error('Error updating portfolio');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Portfolio</h1>
          <Link to="/admin/portfolio/new" className="btn btn-primary">
            <FaPlus /> Add New Portfolio
          </Link>
        </header>

        <div className="filter-tabs">
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({items.length})
          </button>
          <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
            Active
          </button>
          <button className={`tab ${filter === 'inactive' ? 'active' : ''}`} onClick={() => setFilter('inactive')}>
            Inactive
          </button>
        </div>

        {items.length > 0 ? (
          <div className="portfolio-grid">
            {items.map(item => (
              <div key={item._id} className="portfolio-card card">
                {item.thumbnailImage && (
                  <div className="portfolio-image">
                    <img src={item.thumbnailImage} alt={item.title} />
                  </div>
                )}
                <div className="portfolio-info">
                  <h3>{item.title}</h3>
                  <p className="portfolio-client">{item.client}</p>
                  <p className="portfolio-category">{item.category}</p>
                  <div className="portfolio-actions">
                    <button
                      onClick={() => handleToggleActive(item._id, item.isActive)}
                      className={`btn btn-sm ${item.isActive ? 'btn-warning' : 'btn-success'}`}
                    >
                      {item.isActive ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <Link to={`/admin/portfolio/edit/${item._id}`} className="btn btn-sm btn-secondary">
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
            <p>No portfolio items yet. Add your first portfolio.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PortfolioList;
