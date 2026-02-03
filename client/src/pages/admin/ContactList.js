import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import { FaTrash, FaEnvelope, FaCheck, FaTimes } from 'react-icons/fa';
import './Admin.css';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchContacts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/contact/admin${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(contacts.filter(c => c._id !== id));
        toast.success('Message deleted successfully');
      } catch (err) {
        toast.error('Error deleting message');
      }
    }
  };

  const handleToggleRead = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/contact/${id}`, 
        { isRead: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchContacts();
      toast.success(currentStatus ? 'Marked as unread' : 'Marked as read');
    } catch (err) {
      toast.error('Error updating message');
    }
  };

  if (loading) {
    return <AdminLayout><div className="loading">Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="admin-page full-page">
        <header className="admin-header">
          <h1>Contact Messages</h1>
        </header>

        <div className="filter-tabs">
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All ({contacts.length})
          </button>
          <button className={`tab ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
            Unread
          </button>
          <button className={`tab ${filter === 'read' ? 'active' : ''}`} onClick={() => setFilter('read')}>
            Read
          </button>
        </div>

        {contacts.length > 0 ? (
          <div className="contact-list">
            {contacts.map(contact => (
              <div key={contact._id} className={`contact-item card ${contact.isRead ? 'read' : 'unread'}`}>
                <div className="contact-header">
                  <div className="contact-sender">
                    <FaEnvelope className={contact.isRead ? 'icon-read' : 'icon-unread'} />
                    <div>
                      <h3>{contact.name}</h3>
                      <p>{contact.email}</p>
                    </div>
                  </div>
                  <span className="contact-date">{new Date(contact.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="contact-subject">
                  <strong>Subject:</strong> {contact.subject || 'No subject'}
                </div>
                <div className="contact-message">
                  <p>{contact.message}</p>
                </div>
                <div className="contact-actions">
                  <button onClick={() => handleToggleRead(contact._id, contact.isRead)} className="btn btn-sm btn-secondary">
                    {contact.isRead ? <FaTimes /> : <FaCheck />} {contact.isRead ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <a href={`mailto:${contact.email}`} className="btn btn-sm btn-primary">
                    <FaEnvelope /> Reply
                  </a>
                  <button onClick={() => handleDelete(contact._id)} className="btn btn-sm btn-danger">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state card">
            <p>No contact messages yet.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContactList;
