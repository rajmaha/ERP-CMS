import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaTrash, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchContacts();
  }, [statusFilter]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = statusFilter ? `/api/contact?status=${statusFilter}` : '/api/contact';
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/contact/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(contacts.filter(c => c._id !== id));
        toast.success('Contact deleted successfully');
      } catch (err) {
        toast.error('Error deleting contact');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/contact/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      toast.success('Status updated successfully');
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page full-page">
        <header className="admin-header">
          <h1>Contact Messages</h1>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ maxWidth: '200px' }}
          >
            <option value="">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </header>

        {loading ? (
          <div className="loading">Loading contacts...</div>
        ) : contacts.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact._id}>
                    <td className="title-cell">{contact.name}</td>
                    <td>
                      <a href={`mailto:${contact.email}`} className="email-link">
                        <FaEnvelope /> {contact.email}
                      </a>
                    </td>
                    <td>{contact.subject}</td>
                    <td>
                      <select 
                        value={contact.status}
                        onChange={(e) => handleStatusChange(contact._id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleDelete(contact._id)} className="btn btn-sm btn-danger">
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
            <p>No contacts found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminContacts;
