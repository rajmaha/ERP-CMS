import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import './Admin.css';

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/pages/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPages(pages.filter(page => page._id !== id));
        toast.success('Page deleted successfully');
      } catch (err) {
        toast.error('Error deleting page');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: { class: 'status-published', text: 'Published' },
      draft: { class: 'status-draft', text: 'Draft' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Pages</h1>
          <Link to="/admin/pages/new" className="btn btn-primary">
            <FaPlus /> Create Page
          </Link>
        </header>

        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{width: '30%'}}>Title</th>
                  <th style={{width: '25%'}}>Slug</th>
                  <th style={{width: '15%'}}>Status</th>
                  <th style={{width: '15%'}}>Created</th>
                  <th style={{width: '15%'}}>Actions</th>
                </tr>
              </thead>
            <tbody>
              {pages.length > 0 ? (
                pages.map(page => (
                  <tr key={page._id}>
                    <td><strong>{page.title}</strong></td>
                    <td>{page.slug}</td>
                    <td>{getStatusBadge(page.status)}</td>
                    <td>{new Date(page.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {page.status === 'published' && (
                          <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                            <FaEye />
                          </a>
                        )}
                        <Link to={`/admin/pages/edit/${page._id}`} className="btn btn-sm btn-secondary">
                          <FaEdit />
                        </Link>
                        <button onClick={() => handleDelete(page._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No pages found. Create your first page to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PagesList;
