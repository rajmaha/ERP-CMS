import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaEye, FaTrash, FaEnvelope, FaPhone } from 'react-icons/fa';
import './Admin.css';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/contact/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(messages.filter(msg => msg._id !== id));
        toast.success('Message deleted successfully');
      } catch (err) {
        toast.error('Error deleting message');
      }
    }
  };

  const viewMessage = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page full-page">
        <header className="admin-header">
          <h1>Contact Messages</h1>
          <span className="badge-count">{messages.length} Messages</span>
        </header>

        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length > 0 ? (
                messages.map(message => (
                  <tr key={message._id}>
                    <td><strong>{message.name}</strong></td>
                    <td>{message.email}</td>
                    <td>{message.subject || 'No subject'}</td>
                    <td>{new Date(message.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => viewMessage(message)} className="btn btn-sm btn-info">
                          <FaEye /> View
                        </button>
                        <a href={`mailto:${message.email}`} className="btn btn-sm btn-secondary">
                          <FaEnvelope /> Reply
                        </a>
                        <button onClick={() => handleDelete(message._id)} className="btn btn-sm btn-danger">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                    No messages yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Message Detail Modal */}
        {showModal && selectedMessage && (
          <>
            <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
            <div className="message-modal">
              <div className="modal-header">
                <h2>Message Details</h2>
                <button onClick={() => setShowModal(false)} className="close-btn">✕</button>
              </div>

              <div className="modal-body">
                <div className="message-info">
                  <div className="info-row">
                    <strong>From:</strong>
                    <span>{selectedMessage.name}</span>
                  </div>
                  <div className="info-row">
                    <strong>Email:</strong>
                    <span>
                      <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                    </span>
                  </div>
                  {selectedMessage.subject && (
                    <div className="info-row">
                      <strong>Subject:</strong>
                      <span>{selectedMessage.subject}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <strong>Date:</strong>
                    <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="message-content">
                  <h3>Message:</h3>
                  <p>{selectedMessage.message}</p>
                </div>

                <div className="modal-actions">
                  <a href={`mailto:${selectedMessage.email}`} className="btn btn-primary">
                    <FaEnvelope /> Reply via Email
                  </a>
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

export default ContactMessages;
