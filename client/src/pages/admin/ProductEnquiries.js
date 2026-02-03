import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEye, FaTrash, FaEnvelope } from 'react-icons/fa';
import './Admin.css';

const ProductEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEnquiries();
  }, [filter]);

  const fetchEnquiries = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/product-enquiries/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnquiries(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/product-enquiries/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEnquiries();
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/product-enquiries/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnquiries(enquiries.filter(enq => enq._id !== id));
        toast.success('Enquiry deleted successfully');
      } catch (err) {
        toast.error('Error deleting enquiry');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { class: 'status-draft', text: 'New' },
      contacted: { class: 'status-pending', text: 'Contacted' },
      closed: { class: 'status-published', text: 'Closed' }
    };
    const badge = badges[status] || badges.new;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Product Enquiries</h1>
          <span className="badge-count">{enquiries.length} Enquiries</span>
        </header>

        <div className="filters" style={{ marginBottom: '2rem' }}>
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>
            All ({enquiries.length})
          </button>
          <button onClick={() => setFilter('new')} className={`filter-btn ${filter === 'new' ? 'active' : ''}`}>
            New
          </button>
          <button onClick={() => setFilter('contacted')} className={`filter-btn ${filter === 'contacted' ? 'active' : ''}`}>
            Contacted
          </button>
          <button onClick={() => setFilter('closed')} className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}>
            Closed
          </button>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? (
                enquiries.map(enquiry => (
                  <tr key={enquiry._id}>
                    <td>
                      <strong>{enquiry.name}</strong><br />
                      <small>{enquiry.email}</small>
                    </td>
                    <td>{enquiry.productName}</td>
                    <td>
                      {getStatusBadge(enquiry.status)}
                      <select
                        value={enquiry.status}
                        onChange={(e) => updateStatus(enquiry._id, e.target.value)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem', fontSize: '0.875rem' }}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td>{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <a href={`mailto:${enquiry.email}`} className="btn btn-sm btn-secondary">
                          <FaEnvelope /> Reply
                        </a>
                        <button onClick={() => handleDelete(enquiry._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No enquiries found
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

export default ProductEnquiries;
