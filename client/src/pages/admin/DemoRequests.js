import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaCalendar, FaClock, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';
import './Admin.css';

const DemoRequests = () => {
  const [demos, setDemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingNotes, setEditingNotes] = useState('');

  useEffect(() => {
    fetchDemos();
  }, [filterStatus]);

  const fetchDemos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = filterStatus === 'all' 
        ? '/api/demos'
        : `/api/demos?status=${filterStatus}`;
      
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDemos(res.data.data || []);
    } catch (err) {
      console.error('Error fetching demos:', err);
      toast.error('Error loading demo requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/demos/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Demo status updated');
      fetchDemos();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this demo request?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/demos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Demo request deleted');
      fetchDemos();
    } catch (err) {
      toast.error('Error deleting demo request');
    }
  };

  const handleEditNotes = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/demos/${id}`, { notes: editingNotes }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Notes updated');
      setSelectedDemo(null);
      setEditingNotes('');
      fetchDemos();
    } catch (err) {
      toast.error('Error updating notes');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'badge badge-warning',
      scheduled: 'badge badge-info',
      completed: 'badge badge-success',
      cancelled: 'badge badge-danger'
    };
    return statusStyles[status] || 'badge badge-secondary';
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading demo requests...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Demo Requests</h1>
        </header>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
              onClick={() => setFilterStatus('all')}
            >
              All ({demos.length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
              onClick={() => setFilterStatus('pending')}
            >
              Pending ({demos.filter(d => d.status === 'pending').length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'scheduled' ? 'active' : ''}`}
              onClick={() => setFilterStatus('scheduled')}
            >
              Scheduled ({demos.filter(d => d.status === 'scheduled').length})
            </button>
            <button
              className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
              onClick={() => setFilterStatus('completed')}
            >
              Completed ({demos.filter(d => d.status === 'completed').length})
            </button>
          </div>
        </div>

        {demos.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Product</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Preferred Time</th>
                  <th>Preferred Date</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {demos.map(demo => (
                  <tr key={demo._id}>
                    <td><strong>{demo.name}</strong></td>
                    <td>{demo.productName}</td>
                    <td>{demo.email}</td>
                    <td>{demo.phone}</td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>
                        {demo.preferredTime}
                      </span>
                    </td>
                    <td>
                      {demo.preferredDate ? new Date(demo.preferredDate).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <select
                        value={demo.status}
                        onChange={(e) => handleStatusChange(demo._id, e.target.value)}
                        className={`status-select ${getStatusBadge(demo.status)}`}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{new Date(demo.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => {
                          setSelectedDemo(demo);
                          setEditingNotes(demo.notes || '');
                          setShowModal(true);
                        }}
                        className="btn btn-sm btn-secondary"
                        title="Edit notes"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(demo._id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-light)' }}>No demo requests yet</p>
          </div>
        )}

        {/* Notes Modal */}
        {showModal && selectedDemo && (
          <>
            <div 
              className="modal-overlay" 
              onClick={() => setShowModal(false)}
            ></div>
            <div className="enquiry-modal">
              <div className="modal-header">
                <h2>Demo Request Details</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
              </div>

              <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto', maxHeight: '500px' }}>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Name</label>
                    <p>{selectedDemo.name}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Email</label>
                    <p><FaEnvelope /> {selectedDemo.email}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Phone</label>
                    <p><FaPhone /> {selectedDemo.phone}</p>
                  </div>
                  {selectedDemo.company && (
                    <div>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Company</label>
                      <p><FaBuilding /> {selectedDemo.company}</p>
                    </div>
                  )}
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Product</label>
                    <p>{selectedDemo.productName}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Preferred Time</label>
                    <p><FaClock /> {selectedDemo.preferredTime}</p>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Preferred Date</label>
                    <p><FaCalendar /> {selectedDemo.preferredDate ? new Date(selectedDemo.preferredDate).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  {selectedDemo.message && (
                    <div>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Message</label>
                      <p>{selectedDemo.message}</p>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Internal Notes</label>
                  <textarea
                    value={editingNotes}
                    onChange={(e) => setEditingNotes(e.target.value)}
                    className="form-control"
                    rows="4"
                    placeholder="Add notes about this demo request..."
                  ></textarea>
                </div>

                <div className="form-actions" style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => handleEditNotes(selectedDemo._id)}
                    className="btn btn-primary"
                  >
                    Save Notes
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default DemoRequests;
