import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaTrash, FaEye, FaArrowLeft } from 'react-icons/fa';
import './Admin.css';

const FormSubmissions = () => {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/forms/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundForm = res.data.data.find(f => f._id === id);
      setForm(foundForm);
    } catch (err) {
      console.error('Error fetching form:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/forms/admin/${id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (submissionId) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/forms/admin/submissions/${submissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmissions(submissions.filter(sub => sub._id !== submissionId));
        toast.success('Submission deleted successfully');
      } catch (err) {
        toast.error('Error deleting submission');
      }
    }
  };

  const viewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page">
        <Link to="/admin/forms" className="back-link">
          <FaArrowLeft /> Back to Forms
        </Link>

        <header className="admin-header">
          <h1>{form?.title} - Submissions</h1>
          <span className="badge-count">{submissions.length} Submissions</span>
        </header>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Submitted At</th>
                <th>Responses</th>
                <th>IP Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map(submission => (
                  <tr key={submission._id}>
                    <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                    <td>{submission.responses?.length || 0} responses</td>
                    <td>{submission.ipAddress || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => viewSubmission(submission)} className="btn btn-sm btn-info">
                          <FaEye /> View
                        </button>
                        <button onClick={() => handleDelete(submission._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                    No submissions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Submission Detail Modal */}
        {showModal && selectedSubmission && (
          <>
            <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
            <div className="message-modal">
              <div className="modal-header">
                <h2>Submission Details</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
              </div>

              <div className="modal-body">
                <div className="message-info">
                  <div className="info-row">
                    <strong>Submitted:</strong>
                    <span>{new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <strong>IP Address:</strong>
                    <span>{selectedSubmission.ipAddress || 'N/A'}</span>
                  </div>
                </div>

                <div className="message-content">
                  <h3>Responses:</h3>
                  {selectedSubmission.responses?.map((response, index) => (
                    <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '6px' }}>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-color)' }}>
                        {response.label}
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text-light)' }}>
                        {Array.isArray(response.value) ? response.value.join(', ') : response.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowModal(false)} className="btn btn-secondary">
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

export default FormSubmissions;
