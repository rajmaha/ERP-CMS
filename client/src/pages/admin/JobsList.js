import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBriefcase, FaUsers } from 'react-icons/fa';
import './Admin.css';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/jobs/admin/all${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(jobs.filter(job => job._id !== id));
        toast.success('Job deleted successfully');
      } catch (err) {
        toast.error('Error deleting job');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'status-draft', text: 'Draft' },
      active: { class: 'status-published', text: 'Active' },
      closed: { class: 'status-rejected', text: 'Closed' },
      filled: { class: 'status-pending', text: 'Filled' }
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
          <h1>Job Postings</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/admin/jobs/applications" className="btn btn-secondary">
              <FaUsers /> Applications
            </Link>
            <Link to="/admin/jobs/new" className="btn btn-primary">
              <FaPlus /> New Job
            </Link>
          </div>
        </header>

        <div className="filters" style={{ marginBottom: '2rem' }}>
          <button onClick={() => setFilter('all')} className={`filter-btn ${filter === 'all' ? 'active' : ''}`}>
            All ({jobs.length})
          </button>
          <button onClick={() => setFilter('draft')} className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}>
            Draft
          </button>
          <button onClick={() => setFilter('active')} className={`filter-btn ${filter === 'active' ? 'active' : ''}`}>
            Active
          </button>
          <button onClick={() => setFilter('closed')} className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}>
            Closed
          </button>
          <button onClick={() => setFilter('filled')} className={`filter-btn ${filter === 'filled' ? 'active' : ''}`}>
            Filled
          </button>
        </div>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Type</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length > 0 ? (
                jobs.map(job => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                      {job.featured && <span className="badge-featured" style={{ marginLeft: '0.5rem' }}>Featured</span>}
                    </td>
                    <td>{job.department}</td>
                    <td>{job.location}</td>
                    <td><span style={{ textTransform: 'capitalize' }}>{job.employmentType}</span></td>
                    <td>{job.applicationCount}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>
                      <div className="action-buttons">
                        {job.status === 'active' && (
                          <a href={`/careers/${job.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-info">
                            <FaEye />
                          </a>
                        )}
                        <Link to={`/admin/jobs/edit/${job._id}`} className="btn btn-sm btn-secondary">
                          <FaEdit />
                        </Link>
                        <Link to={`/admin/jobs/${job._id}/applications`} className="btn btn-sm btn-info">
                          <FaBriefcase /> {job.applicationCount}
                        </Link>
                        <button onClick={() => handleDelete(job._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                    No jobs found
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

export default JobsList;
