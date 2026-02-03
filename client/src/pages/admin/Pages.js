import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    isPublished: false
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/pages/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPages(res.data.data);
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
        setPages(pages.filter(p => p._id !== id));
        toast.success('Page deleted successfully');
      } catch (err) {
        toast.error('Error deleting page');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Pages</h1>
          <Link to="/admin/pages/new" className="btn btn-primary">
            <FaPlus /> New Page
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading pages...</div>
        ) : pages.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page._id}>
                    <td className="title-cell">{page.title}</td>
                    <td>{page.slug}</td>
                    <td>
                      {page.isPublished ? (
                        <span className="badge badge-success"><FaCheck /> Published</span>
                      ) : (
                        <span className="badge badge-warning"><FaTimes /> Draft</span>
                      )}
                    </td>
                    <td>{new Date(page.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/pages/${page._id}`} className="btn btn-sm btn-secondary">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(page._id)} className="btn btn-sm btn-danger">
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
            <p>No pages yet. Create your first page to get started.</p>
            <Link to="/admin/pages/new" className="btn btn-primary">
              Create Page
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPages;
