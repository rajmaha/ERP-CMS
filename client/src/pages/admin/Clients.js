import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { FaEdit, FaTrash, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(clients.filter(c => c._id !== id));
        toast.success('Client deleted successfully');
      } catch (err) {
        toast.error('Error deleting client');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <header className="admin-header">
          <h1>Manage Clients</h1>
          <Link to="/admin/clients/new" className="btn btn-primary">
            <FaPlus /> New Client
          </Link>
        </header>

        {loading ? (
          <div className="loading">Loading clients...</div>
        ) : clients.length > 0 ? (
          <div className="admin-table-wrapper card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Name</th>
                  <th>Website</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client._id}>
                    <td>
                      {client.logo && (
                        <img src={client.logo} alt={client.name} className="table-image" />
                      )}
                    </td>
                    <td className="title-cell">{client.name}</td>
                    <td>{client.website ? <a href={client.website} target="_blank" rel="noopener noreferrer">Link</a> : '-'}</td>
                    <td>
                      {client.isActive ? (
                        <span className="badge badge-success"><FaCheck /> Active</span>
                      ) : (
                        <span className="badge badge-warning"><FaTimes /> Inactive</span>
                      )}
                    </td>
                    <td>
                      {client.isFeatured ? (
                        <FaCheck className="text-success" />
                      ) : (
                        <FaTimes className="text-muted" />
                      )}
                    </td>
                    <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/admin/clients/${client._id}`} className="btn btn-sm btn-secondary">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(client._id)} className="btn btn-sm btn-danger">
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
            <p>No clients yet. Add your first client to get started.</p>
            <Link to="/admin/clients/new" className="btn btn-primary">
              Create Client
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
