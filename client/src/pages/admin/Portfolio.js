import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/portfolio', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolio(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/portfolio/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPortfolio(portfolio.filter(p => p._id !== id));
        toast.success('Portfolio item deleted successfully');
      } catch (err) {
        toast.error('Error deleting portfolio item');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Portfolio</h1>
          <Link to="/admin/portfolio/new" className="btn btn-primary">
            <FaPlus /> New Project
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading portfolio...</div>
        ) : portfolio.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map(item => (
                  <tr key={item._id}>
                    <td className="title-cell">{item.title}</td>
                    <td>{item.category}</td>
                    <td>{item.client || '-'}</td>
                    <td>
                      {item.isActive ? (
                        <span className="badge badge-success"><FaCheck /> Active</span>
                      ) : (
                        <span className="badge badge-warning"><FaTimes /> Inactive</span>
                      )}
                    </td>
                    <td>
                      {item.isFeatured ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-muted" />
                      )}
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/portfolio/${item._id}`} className="btn btn-sm btn-secondary">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(item._id)} className="btn btn-sm btn-danger">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state card">
            <p>No portfolio items yet. Create your first project to get started.</p>
            <Link to="/admin/portfolio/new" className="btn btn-primary">
              Create Project
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPortfolio;
