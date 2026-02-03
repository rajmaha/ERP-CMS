import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEye, FaTrash, FaDownload, FaStar } from 'react-icons/fa';
import './Admin.css';

const ApplicationsList = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, [filter, jobId]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (jobId) params.append('jobId', jobId);
      
      const res = await axios.get(`/api/jobs/applications/all?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/jobs/applications/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchApplications();
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/jobs/applications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(applications.filter(app => app._id !== id));
        toast.success('Application deleted successfully');
      } catch (err) {
        toast.error('Error deleting application');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { class: 'status-draft', text: 'New' },
      reviewing: { class: 'status-pending', text: 'Reviewing' },
      shortlisted: { class: 'status-published', text: 'Shortlisted' },
      interviewed: { class: 'status-pending', text: 'Interviewed' },
      rejected: { class: 'status-rejected', text: 'Rejected' },
      hired: { class: 'status-published', text: 'Hired' }
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
          <h1>Job Applications</h1>
          <Link to="/admin/jobs" className="btn btn-secondary">Back to Jobs</Link>
        </header>

        <div className="filters" style={{ marginBottom: '2rem' }}>
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>
            All ({applications.length})
          </button>
          <button onClick={() => setFilter('new')} className={`filter-btn ${filter === 'new' ? 'active' : ''}`}>New</button>
          <button onClick={() => setFilter('reviewing')} className={`filter-btn ${filter === 'reviewing' ? 'active' : ''}`}>Reviewing</button>
          <button onClick={() => setFilter('shortlisted')} className={`filter-btn ${filter === 'shortlisted' ? 'active' : ''}`}>Shortlisted</button>
          <button onClick={() => setFilter('interviewed')} className={`filter-btn ${filter === 'interviewed' ? 'active' : ''}`}>Interviewed</button>
          <button onClick={() => setFilter('hired')} className={`filter-btn ${filter === 'hired' ? 'active' : ''}`}>Hired</button>
          <button onClick={() => setFilter('rejected')} className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}>Rejected</button>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.firstName} {app.lastName}</strong><br />
                      <small>{app.email} | {app.phone}</small>
                    </td>
                    <td>{app.job?.title}</td>
                    <td>{app.experience} years</td>
                    <td>
                      {getStatusBadge(app.status)}
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        style={{ marginLeft: '0.5rem', padding: '0.25rem', fontSize: '0.875rem' }}
                      >
                        <option value="new">New</option>
                        <option value="reviewing">Reviewing</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/jobs/applications/${app._id}`} className="btn btn-sm btn-secondary">
                          <FaEye /> View
                        </Link>
                        {app.resume && (
                          <a href={app.resume} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                            <FaDownload /> Resume
                          </a>
                        )}
                        <button onClick={() => handleDelete(app._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No applications found
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

export default ApplicationsList;
