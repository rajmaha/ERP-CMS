import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaClipboardList } from 'react-icons/fa';
import './Admin.css';

const FormsList = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/forms/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this form? All submissions will be lost.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/forms/admin/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForms(forms.filter(form => form._id !== id));
        toast.success('Form deleted successfully');
      } catch (err) {
        toast.error('Error deleting form');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'status-draft', text: 'Draft' },
      active: { class: 'status-published', text: 'Active' },
      closed: { class: 'status-rejected', text: 'Closed' }
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
          <h1>Dynamic Forms</h1>
          <Link to="/admin/forms/new" className="btn btn-primary">
            <FaPlus /> Create Form
          </Link>
        </header>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Form Title</th>
                <th>Fields</th>
                <th>Submissions</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.length > 0 ? (
                forms.map(form => (
                  <tr key={form._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {form.featureImage && (
                          <img 
                            src={form.featureImage} 
                            alt={form.title}
                            style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <div>
                          <strong>{form.title}</strong>
                          {form.enableRecaptcha && (
                            <span className="badge-featured" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>
                              reCAPTCHA
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{form.fields?.length || 0} fields</td>
                    <td>{form.submissionCount || 0}</td>
                    <td>{getStatusBadge(form.status)}</td>
                    <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {form.status === 'active' && (
                          <a href={`/forms/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                            <FaEye />
                          </a>
                        )}
                        <Link to={`/admin/forms/edit/${form._id}`} className="btn btn-sm btn-secondary">
                          <FaEdit />
                        </Link>
                        <Link to={`/admin/forms/${form._id}/submissions`} className="btn btn-sm btn-info">
                          <FaClipboardList /> {form.submissionCount || 0}
                        </Link>
                        <button onClick={() => handleDelete(form._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No forms found. Create your first form to get started!
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

export default FormsList;
